import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppConfig } from 'src/lib/config';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { CreateTenantDto, PlatformAdminLoginDto, UpdateTenantStatusDto } from './dto/platform-admin.dto';

@Injectable()
export class PlatformAdminService {
    constructor(
        private readonly rawPrisma: PrismaService,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly jwtService: JwtService,
        private readonly config: AppConfig,
    ) { }

    async login(dto: PlatformAdminLoginDto) {
        const admin = await this.rawPrisma.platformAdmin.findUnique({ where: { phone: dto.phone } });
        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(dto.password, admin.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = this.jwtService.sign(
            { platformAdminId: admin.id, phone: admin.phone, type: 'platform' as const },
            { expiresIn: this.config.JWT_EXPIRES_IN },
        );

        return { accessToken };
    }

    async createTenant(dto: CreateTenantDto) {
        // Owner phone is globally unique across the platform - this lookup
        // deliberately bypasses tenant scoping since no tenant exists yet.
        const existingOwner = await this.rawPrisma.users.findUnique({ where: { phone: dto.ownerPhone } });
        if (existingOwner) {
            throw new BadRequestException('Owner phone already exists on the platform');
        }

        const hashedPassword = await bcrypt.hash(dto.ownerPassword, 10);

        return this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.name,
                    botToken: dto.botToken,
                },
            });

            const owner = await tx.users.create({
                data: {
                    firstName: dto.ownerFirstName,
                    lastName: dto.ownerLastName,
                    phone: dto.ownerPhone,
                    password: hashedPassword,
                    role: UserRole.ADMIN,
                    tenantId: tenant.id,
                    mustChangePassword: true,
                },
            });

            return {
                tenant,
                owner: {
                    id: owner.id,
                    phone: owner.phone,
                    firstName: owner.firstName,
                    lastName: owner.lastName,
                    role: owner.role,
                },
            };
        });
    }

    async listTenants() {
        return this.prisma.tenant.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async updateTenantStatus(id: string, dto: UpdateTenantStatusDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        return this.prisma.tenant.update({ where: { id }, data: { status: dto.status } });
    }

    async deleteTenant(id: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        try {
            await this.prisma.tenant.delete({ where: { id } });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new BadRequestException(
                    'This center still has students, teachers, groups or other data and cannot be deleted while that data exists',
                );
            }
            throw error;
        }

        return { message: 'Tenant deleted successfully' };
    }

    // Irreversibly deletes a tenant and every row that belongs to it. Deletion
    // order matters: children must go before the parents they reference, since
    // most tenant-scoped relations have no cascading delete configured.
    async purgeTenant(id: string) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.attachment.deleteMany({ where: { tenantId: id } });
            await tx.messageStatus.deleteMany({ where: { tenantId: id } });
            await tx.chatMember.deleteMany({ where: { tenantId: id } });
            await tx.message.deleteMany({ where: { tenantId: id } });
            await tx.chat.deleteMany({ where: { tenantId: id } });

            await tx.scoreEvent.deleteMany({ where: { tenantId: id } });
            await tx.studentScore.deleteMany({ where: { tenantId: id } });
            await tx.studentPayment.deleteMany({ where: { tenantId: id } });
            await tx.studentGroup.deleteMany({ where: { tenantId: id } });
            await tx.groups.deleteMany({ where: { tenantId: id } });

            await tx.parentStudent.deleteMany({ where: { tenantId: id } });
            await tx.deviceToken.deleteMany({ where: { tenantId: id } });
            await tx.session.deleteMany({ where: { tenantId: id } });
            await tx.users.deleteMany({ where: { tenantId: id } });

            await tx.tenant.delete({ where: { id } });
        });

        return { message: 'Tenant and all associated data permanently deleted' };
    }
}

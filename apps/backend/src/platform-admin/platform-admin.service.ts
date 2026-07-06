import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
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
}

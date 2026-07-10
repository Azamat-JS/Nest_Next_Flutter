import { BadRequestException, Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { AppConfig } from 'src/lib/config';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TelegramBotService } from 'src/telegram/telegram-bot.service';
import { CreateTenantDto, PlatformAdminLoginDto, SetTenantBotDto, UpdateTenantStatusDto } from './dto/platform-admin.dto';

@Injectable()
export class PlatformAdminService {
    private readonly logger = new Logger(PlatformAdminService.name);

    constructor(
        private readonly rawPrisma: PrismaService,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly jwtService: JwtService,
        private readonly config: AppConfig,
        private readonly telegramBot: TelegramBotService,
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

        // Reject bad bot tokens before creating anything.
        if (dto.botToken) {
            await this.validateBotToken(dto.botToken);
        }

        const hashedPassword = await bcrypt.hash(dto.ownerPassword, 10);

        const result = await this.prisma.$transaction(async (tx) => {
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

        // Webhook registration needs the tenant id, so it can only happen
        // after the transaction. Best-effort: a failure here is recoverable
        // by calling PATCH tenants/:id/bot later.
        if (dto.botToken) {
            try {
                result.tenant = await this.registerBotWebhook(result.tenant.id, dto.botToken);
            } catch (error) {
                this.logger.error(`Tenant ${result.tenant.id} created, but bot webhook registration failed`, error instanceof Error ? error.stack : String(error));
            }
        }

        return result;
    }

    async setTenantBot(id: string, dto: SetTenantBotDto) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id } });
        if (!tenant) {
            throw new NotFoundException('Tenant not found');
        }
        await this.validateBotToken(dto.botToken);
        return this.registerBotWebhook(id, dto.botToken);
    }

    private async validateBotToken(botToken: string) {
        try {
            await this.telegramBot.getMe(botToken);
        } catch {
            throw new BadRequestException('botToken was rejected by Telegram - check the token from @BotFather');
        }
    }

    // Points the bot's webhook at this backend and stores the credentials the
    // webhook controller authenticates against.
    private async registerBotWebhook(tenantId: string, botToken: string) {
        if (!this.config.API_PUBLIC_URL) {
            throw new BadRequestException('API_PUBLIC_URL must be configured before connecting a bot');
        }

        const botInfo = await this.telegramBot.getMe(botToken);
        const webhookSecret = randomBytes(32).toString('hex');
        const webhookUrl = `${this.config.API_PUBLIC_URL.replace(/\/$/, '')}/telegram/webhook/${tenantId}`;

        await this.telegramBot.setWebhook(botToken, webhookUrl, webhookSecret);

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: { botToken, botUsername: botInfo.username, webhookSecret },
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

            await tx.telegramLink.deleteMany({ where: { tenantId: id } });
            await tx.parentStudent.deleteMany({ where: { tenantId: id } });
            await tx.deviceToken.deleteMany({ where: { tenantId: id } });
            await tx.session.deleteMany({ where: { tenantId: id } });
            await tx.users.deleteMany({ where: { tenantId: id } });

            await tx.tenant.delete({ where: { id } });
        });

        return { message: 'Tenant and all associated data permanently deleted' };
    }
}

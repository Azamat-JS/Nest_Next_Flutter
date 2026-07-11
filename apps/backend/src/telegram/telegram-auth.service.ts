import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from '@prisma/client';
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { AppConfig } from 'src/lib/config';
import { PrismaService } from 'src/prisma/prisma.service';

// Telegram signs initData when launching a mini app; a stale string is a
// possible replay, so reject anything older than this.
const INIT_DATA_MAX_AGE_SECONDS = 300;

@Injectable()
export class TelegramAuthService {
    constructor(
        private readonly rawPrisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly config: AppConfig,
    ) { }

    // Exchanges Telegram WebApp initData for the same token pair users/login
    // issues, so the mini app can call the API through the normal JwtAuthGuard.
    async authenticate(initData: string) {
        const params = new URLSearchParams(initData);
        const hash = params.get('hash');
        const authDate = Number(params.get('auth_date'));
        const userJson = params.get('user');
        if (!hash || !authDate || !userJson) {
            throw new UnauthorizedException('Malformed initData');
        }

        if (Date.now() / 1000 - authDate > INIT_DATA_MAX_AGE_SECONDS) {
            throw new UnauthorizedException('initData expired - please reopen the app');
        }

        // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
        const dataCheckString = [...params.entries()]
            .filter(([key]) => key !== 'hash')
            .map(([key, value]) => `${key}=${value}`)
            .sort()
            .join('\n');

        // The mini app URL carries no tenant hint, so the tenant is whichever
        // bot's token produces a matching signature (one HMAC per tenant -
        // cheap at the current tenant count).
        const tenant = await this.findTenantBySignature(dataCheckString, hash);
        if (!tenant) {
            throw new UnauthorizedException('initData signature is invalid');
        }
        if (tenant.status !== 'ACTIVE') {
            throw new UnauthorizedException('This center is not currently active');
        }

        let telegramUserId: string;
        try {
            telegramUserId = String(JSON.parse(userJson).id);
        } catch {
            throw new UnauthorizedException('Malformed initData');
        }

        const link = await this.rawPrisma.telegramLink.findUnique({
            where: { tenantId_telegramUserId: { tenantId: tenant.id, telegramUserId } },
            include: { user: true },
        });
        if (!link) {
            throw new UnauthorizedException('Telegram account is not linked - send /start to the bot first');
        }
        // Manually-typed phones stay unverified until the account password is
        // confirmed in the bot chat; they must not grant access to payments
        // and scores.
        if (!link.verified) {
            throw new UnauthorizedException('Phone number is not confirmed yet - please finish verification in the bot chat');
        }

        const user = link.user;
        const payload = {
            userId: user.id,
            phone: user.phone,
            firstName: user.firstName,
            role: user.role,
            tenantId: user.tenantId,
            // Telegram users authenticate via Telegram, never via password, so
            // the pending-password-change gate must not apply to them.
            mustChangePassword: false,
            type: 'tenant' as const,
        };

        const accessToken = this.jwtService.sign(payload, { expiresIn: this.config.JWT_EXPIRES_IN });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN as any });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await this.rawPrisma.session.create({
            data: {
                refreshToken,
                userId: user.id,
                tenantId: user.tenantId,
                expiresAt,
                deviceInfo: 'telegram-mini-app',
            },
        });

        return {
            accessToken,
            refreshToken,
            verified: link.verified,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        };
    }

    private async findTenantBySignature(dataCheckString: string, hash: string): Promise<Tenant | null> {
        const tenants = await this.rawPrisma.tenant.findMany({
            where: { botToken: { not: null } },
        });

        for (const tenant of tenants) {
            const secretKey = createHmac('sha256', 'WebAppData').update(tenant.botToken!).digest();
            const expected = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
            if (this.safeEqual(expected, hash)) {
                return tenant;
            }
        }
        return null;
    }

    private safeEqual(a: string, b: string): boolean {
        // Hashing first equalizes lengths, which timingSafeEqual requires.
        const bufA = createHash('sha256').update(a).digest();
        const bufB = createHash('sha256').update(b).digest();
        return timingSafeEqual(bufA, bufB);
    }
}

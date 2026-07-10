import { Body, Controller, Headers, HttpCode, Logger, Param, Post, UnauthorizedException } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { Public } from 'src/lib/shared/decorators/public';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramLinkService } from './telegram-link.service';
import type { TelegramUpdate } from './types/telegram-update.types';

@Controller('telegram')
export class TelegramWebhookController {
    private readonly logger = new Logger(TelegramWebhookController.name);

    constructor(
        private readonly rawPrisma: PrismaService,
        private readonly linkService: TelegramLinkService,
    ) { }

    @Public()
    @Post('webhook/:tenantId')
    @HttpCode(200)
    async handleWebhook(
        @Param('tenantId') tenantId: string,
        @Headers('x-telegram-bot-api-secret-token') secretToken: string | undefined,
        @Body() update: TelegramUpdate,
    ) {
        const tenant = await this.rawPrisma.tenant.findUnique({ where: { id: tenantId } });

        // The secret header is the only thing authenticating this public route
        // as a genuine call from Telegram's servers.
        if (!tenant?.botToken || !tenant.webhookSecret || !secretToken || !this.secretsMatch(secretToken, tenant.webhookSecret)) {
            throw new UnauthorizedException();
        }

        if (tenant.status !== 'ACTIVE') {
            return { ok: true };
        }

        // Never propagate handler errors: a non-200 response makes Telegram
        // redeliver the same update indefinitely.
        try {
            await this.linkService.handleUpdate(tenant, update);
        } catch (error) {
            this.logger.error(`Failed to handle update for tenant ${tenantId}`, error instanceof Error ? error.stack : String(error));
        }
        return { ok: true };
    }

    private secretsMatch(provided: string, expected: string): boolean {
        // Hashing first equalizes lengths, which timingSafeEqual requires.
        const a = createHash('sha256').update(provided).digest();
        const b = createHash('sha256').update(expected).digest();
        return timingSafeEqual(a, b);
    }
}

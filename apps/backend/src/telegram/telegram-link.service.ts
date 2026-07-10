import { Injectable, Logger } from '@nestjs/common';
import { Tenant, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizePhone } from 'src/lib/shared/helper/normalize_phone';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramUpdate } from './types/telegram-update.types';

// Webhook updates arrive on a public route with no JWT, so there is no tenant
// context for the scoped client - the tenant comes from the webhook URL and
// every query here filters by it explicitly via the raw client (same pattern
// as users/login).
@Injectable()
export class TelegramLinkService {
    private readonly logger = new Logger(TelegramLinkService.name);

    constructor(
        private readonly rawPrisma: PrismaService,
        private readonly bot: TelegramBotService,
    ) { }

    async handleUpdate(tenant: Tenant, update: TelegramUpdate) {
        const message = update.message;
        if (!message?.from || message.chat.type !== 'private' || message.from.is_bot) {
            return;
        }

        const botToken = tenant.botToken!;
        const chatId = String(message.chat.id);
        const telegramUserId = String(message.from.id);

        if (message.contact) {
            // Telegram only sets contact.user_id when the contact is a Telegram
            // user; requiring it to match the sender rejects forwarded contacts.
            if (message.contact.user_id !== message.from.id) {
                await this.bot.sendMessage(botToken, chatId, 'Please share your own contact using the button below, or type your phone number.');
                return;
            }
            await this.linkPhone(tenant, { telegramUserId, chatId, rawPhone: message.contact.phone_number, verified: true });
            return;
        }

        const text = message.text?.trim();
        if (!text) return;

        if (text.startsWith('/start')) {
            const existing = await this.rawPrisma.telegramLink.findUnique({
                where: { tenantId_telegramUserId: { tenantId: tenant.id, telegramUserId } },
                include: { user: true },
            });
            if (existing) {
                await this.bot.sendMiniAppButton(botToken, chatId, existing.user.firstName);
            } else {
                await this.bot.sendPhoneRequest(botToken, chatId);
            }
            return;
        }

        const phone = normalizePhone(text);
        if (!phone) {
            await this.bot.sendMessage(botToken, chatId, 'That does not look like a phone number. Please type it like +998901234567, or use the share button.');
            return;
        }
        await this.linkPhone(tenant, { telegramUserId, chatId, rawPhone: text, verified: false });
    }

    private async linkPhone(
        tenant: Tenant,
        args: { telegramUserId: string; chatId: string; rawPhone: string; verified: boolean },
    ) {
        const botToken = tenant.botToken!;
        const phone = normalizePhone(args.rawPhone);
        if (!phone) {
            await this.bot.sendMessage(botToken, args.chatId, 'That does not look like a phone number. Please type it like +998901234567, or use the share button.');
            return;
        }

        // Phone is globally unique, so the lookup itself is cross-tenant; the
        // user must still belong to the tenant that owns this bot.
        const user = await this.rawPrisma.users.findUnique({ where: { phone } });
        const isPortalRole = user?.role === UserRole.PARENT || user?.role === UserRole.STUDENT;
        if (!user || user.tenantId !== tenant.id || !isPortalRole) {
            this.logger.log(`Link attempt with unregistered phone for tenant ${tenant.id}`);
            await this.bot.sendMessage(
                botToken,
                args.chatId,
                'This phone number is not registered as a parent or student. Please contact your learning centre, then try again.',
            );
            return;
        }

        await this.rawPrisma.telegramLink.upsert({
            where: { tenantId_telegramUserId: { tenantId: tenant.id, telegramUserId: args.telegramUserId } },
            create: {
                tenantId: tenant.id,
                userId: user.id,
                telegramUserId: args.telegramUserId,
                chatId: args.chatId,
                phone,
                verified: args.verified,
            },
            update: {
                userId: user.id,
                chatId: args.chatId,
                phone,
                verified: args.verified,
            },
        });

        await this.bot.sendMiniAppButton(botToken, args.chatId, user.firstName);
    }
}

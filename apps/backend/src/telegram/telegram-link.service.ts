import { Injectable, Logger } from '@nestjs/common';
import { Tenant, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizePhone } from 'src/lib/shared/helper/normalize_phone';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramMessage, TelegramUpdate } from './types/telegram-update.types';

const MAX_PASSWORD_ATTEMPTS = 5;

// Webhook updates arrive on a public route with no JWT, so there is no tenant
// context for the scoped client - the tenant comes from the webhook URL and
// every query here filters by it explicitly via the raw client (same pattern
// as users/login).
//
// Linking is a tiny state machine keyed on the TelegramLink row:
//   no row              -> expecting /start, a contact, or a typed phone
//   row, verified=false -> typed phone accepted, awaiting the account password
//   row, verified=true  -> linked; /start replies with the mini app button
// Contact-share links instantly (Telegram attests the number belongs to the
// sender); a typed phone could be anyone's, so it must be confirmed with the
// account password before the link activates.
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
            await this.linkVerifiedByContact(tenant, { telegramUserId, chatId, rawPhone: message.contact.phone_number });
            return;
        }

        const text = message.text?.trim();
        if (!text) return;

        const link = await this.rawPrisma.telegramLink.findUnique({
            where: { tenantId_telegramUserId: { tenantId: tenant.id, telegramUserId } },
            include: { user: true },
        });

        if (text.startsWith('/start')) {
            if (link?.verified) {
                await this.bot.sendMiniAppButton(botToken, chatId, link.user.firstName);
            } else if (link) {
                await this.bot.sendMessage(botToken, chatId, 'Almost done! Please type your account password to confirm the phone number, or share your contact with the button instead.');
            } else {
                await this.bot.sendPhoneRequest(botToken, chatId);
            }
            return;
        }

        // A phone number always (re)starts the linking flow, even while a
        // password is pending or the account is already linked - it's the
        // escape hatch when the wrong number was entered.
        const phone = normalizePhone(text);
        if (phone) {
            await this.beginManualLink(tenant, { telegramUserId, chatId, phone });
            return;
        }

        if (link && !link.verified) {
            await this.handlePasswordAttempt(tenant, link, message);
            return;
        }

        await this.bot.sendMessage(botToken, chatId, 'That does not look like a phone number. Please type it like +998901234567, or use the share button.');
    }

    private async linkVerifiedByContact(
        tenant: Tenant,
        args: { telegramUserId: string; chatId: string; rawPhone: string },
    ) {
        const botToken = tenant.botToken!;
        const phone = normalizePhone(args.rawPhone);
        const user = phone ? await this.findPortalUser(tenant, phone) : null;
        if (!phone || !user) {
            await this.sendNotRegistered(botToken, args.chatId);
            return;
        }

        await this.upsertLink(tenant.id, { ...args, phone, userId: user.id, verified: true });
        await this.bot.sendMiniAppButton(botToken, args.chatId, user.firstName);
    }

    private async beginManualLink(
        tenant: Tenant,
        args: { telegramUserId: string; chatId: string; phone: string },
    ) {
        const botToken = tenant.botToken!;
        const user = await this.findPortalUser(tenant, args.phone);
        if (!user) {
            await this.sendNotRegistered(botToken, args.chatId);
            return;
        }

        await this.upsertLink(tenant.id, { ...args, userId: user.id, verified: false });
        await this.bot.sendMessage(
            botToken,
            args.chatId,
            `This number belongs to ${user.firstName}. To confirm it is really you, please type your account password (the one used to sign in). Sharing your contact with the button instead confirms instantly.`,
        );
    }

    private async handlePasswordAttempt(
        tenant: Tenant,
        link: { id: string; verifyAttempts: number; user: { id: string; firstName: string; password: string } },
        message: TelegramMessage,
    ) {
        const botToken = tenant.botToken!;
        const chatId = String(message.chat.id);

        // Keep the plaintext password out of the visible chat history.
        await this.bot.deleteMessage(botToken, chatId, message.message_id);

        const isValid = await bcrypt.compare(message.text!.trim(), link.user.password);
        if (isValid) {
            await this.rawPrisma.telegramLink.update({
                where: { id: link.id },
                data: { verified: true, verifyAttempts: 0 },
            });
            await this.bot.sendMiniAppButton(botToken, chatId, link.user.firstName);
            return;
        }

        const attempts = link.verifyAttempts + 1;
        if (attempts >= MAX_PASSWORD_ATTEMPTS) {
            await this.rawPrisma.telegramLink.delete({ where: { id: link.id } });
            this.logger.warn(`Too many failed password attempts for tenant ${tenant.id}, telegram user ${message.from!.id}`);
            await this.bot.sendPhoneRequest(botToken, chatId);
            await this.bot.sendMessage(botToken, chatId, 'Too many wrong attempts. Please share your contact with the button, or start over with your phone number.');
            return;
        }

        await this.rawPrisma.telegramLink.update({
            where: { id: link.id },
            data: { verifyAttempts: attempts },
        });
        await this.bot.sendMessage(botToken, chatId, `Wrong password, please try again (${MAX_PASSWORD_ATTEMPTS - attempts} attempts left). You can also share your contact with the button instead.`);
    }

    // Phone is globally unique, so the lookup itself is cross-tenant; the
    // user must still belong to the tenant that owns this bot.
    private async findPortalUser(tenant: Tenant, phone: string) {
        const user = await this.rawPrisma.users.findUnique({ where: { phone } });
        const isPortalRole = user?.role === UserRole.PARENT || user?.role === UserRole.STUDENT;
        if (!user || user.tenantId !== tenant.id || !isPortalRole) {
            this.logger.log(`Link attempt with unregistered phone for tenant ${tenant.id}`);
            return null;
        }
        return user;
    }

    private async upsertLink(
        tenantId: string,
        args: { telegramUserId: string; chatId: string; phone: string; userId: string; verified: boolean },
    ) {
        await this.rawPrisma.telegramLink.upsert({
            where: { tenantId_telegramUserId: { tenantId, telegramUserId: args.telegramUserId } },
            create: {
                tenantId,
                userId: args.userId,
                telegramUserId: args.telegramUserId,
                chatId: args.chatId,
                phone: args.phone,
                verified: args.verified,
            },
            update: {
                userId: args.userId,
                chatId: args.chatId,
                phone: args.phone,
                verified: args.verified,
                verifyAttempts: 0,
            },
        });
    }

    private async sendNotRegistered(botToken: string, chatId: string) {
        await this.bot.sendMessage(
            botToken,
            chatId,
            'This phone number is not registered as a parent or student. Please contact your learning centre, then try again.',
        );
    }
}

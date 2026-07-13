import { Injectable, Logger } from '@nestjs/common';
import { Tenant, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { normalizePhone } from 'src/lib/shared/helper/normalize_phone';
import { TelegramBotService } from './telegram-bot.service';
import { BOT_LANGUAGE_LABELS, BotLanguage, isBotLanguage, t } from './telegram-i18n';
import { TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from './types/telegram-update.types';

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
        if (update.callback_query) {
            await this.handleCallbackQuery(tenant, update.callback_query);
            return;
        }

        const message = update.message;
        if (!message?.from || message.chat.type !== 'private' || message.from.is_bot) {
            return;
        }

        const botToken = tenant.botToken!;
        const chatId = String(message.chat.id);
        const telegramUserId = String(message.from.id);
        const lang = await this.getLanguage(tenant.id, telegramUserId);

        if (message.contact) {
            // Telegram only sets contact.user_id when the contact is a Telegram
            // user; requiring it to match the sender rejects forwarded contacts.
            if (message.contact.user_id !== message.from.id) {
                await this.bot.sendMessage(botToken, chatId, t(lang, 'ownContactOnly'));
                return;
            }
            await this.linkVerifiedByContact(tenant, { telegramUserId, chatId, rawPhone: message.contact.phone_number, lang });
            return;
        }

        const text = message.text?.trim();
        if (!text) return;

        if (text.startsWith('/language')) {
            await this.bot.sendLanguageKeyboard(botToken, chatId, t(lang, 'languagePrompt'));
            return;
        }

        const link = await this.rawPrisma.telegramLink.findUnique({
            where: { tenantId_telegramUserId: { tenantId: tenant.id, telegramUserId } },
            include: { user: true },
        });

        if (text.startsWith('/start')) {
            if (link?.verified) {
                await this.bot.sendMiniAppButton(botToken, chatId, link.user.firstName, lang);
            } else if (link) {
                await this.bot.sendMessage(botToken, chatId, t(lang, 'almostDone'));
            } else {
                await this.bot.sendPhoneRequest(botToken, chatId, lang);
            }
            return;
        }

        // A phone number always (re)starts the linking flow, even while a
        // password is pending or the account is already linked - it's the
        // escape hatch when the wrong number was entered.
        const phone = normalizePhone(text);
        if (phone) {
            await this.beginManualLink(tenant, { telegramUserId, chatId, phone, lang });
            return;
        }

        if (link && !link.verified) {
            await this.handlePasswordAttempt(tenant, link, message, lang);
            return;
        }

        await this.bot.sendMessage(botToken, chatId, t(lang, 'notAPhoneNumber'));
    }

    private async handleCallbackQuery(tenant: Tenant, callbackQuery: TelegramCallbackQuery) {
        const botToken = tenant.botToken!;
        const chatId = callbackQuery.message ? String(callbackQuery.message.chat.id) : undefined;
        const match = callbackQuery.data?.match(/^set_lang:(en|ru|uz)$/);

        if (!match || !chatId) {
            await this.bot.answerCallbackQuery(botToken, callbackQuery.id);
            return;
        }

        const lang = match[1] as BotLanguage;
        const telegramUserId = String(callbackQuery.from.id);
        await this.setLanguage(tenant.id, telegramUserId, lang);

        const confirmation = t(lang, 'languageChanged', BOT_LANGUAGE_LABELS[lang]);
        await this.bot.answerCallbackQuery(botToken, callbackQuery.id, confirmation);
        await this.bot.sendMessage(botToken, chatId, confirmation);
    }

    private async getLanguage(tenantId: string, telegramUserId: string): Promise<BotLanguage> {
        const pref = await this.rawPrisma.telegramUserLanguage.findUnique({
            where: { tenantId_telegramUserId: { tenantId, telegramUserId } },
        });
        return isBotLanguage(pref?.language) ? pref.language : 'en';
    }

    private async setLanguage(tenantId: string, telegramUserId: string, language: BotLanguage) {
        await this.rawPrisma.telegramUserLanguage.upsert({
            where: { tenantId_telegramUserId: { tenantId, telegramUserId } },
            create: { tenantId, telegramUserId, language },
            update: { language },
        });
    }

    private async linkVerifiedByContact(
        tenant: Tenant,
        args: { telegramUserId: string; chatId: string; rawPhone: string; lang: BotLanguage },
    ) {
        const botToken = tenant.botToken!;
        const phone = normalizePhone(args.rawPhone);
        const user = phone ? await this.findPortalUser(tenant, phone) : null;
        if (!phone || !user) {
            await this.sendNotRegistered(botToken, args.chatId, args.lang);
            return;
        }

        await this.upsertLink(tenant.id, { ...args, phone, userId: user.id, verified: true });
        await this.bot.sendMiniAppButton(botToken, args.chatId, user.firstName, args.lang);
    }

    private async beginManualLink(
        tenant: Tenant,
        args: { telegramUserId: string; chatId: string; phone: string; lang: BotLanguage },
    ) {
        const botToken = tenant.botToken!;
        const user = await this.findPortalUser(tenant, args.phone);
        if (!user) {
            await this.sendNotRegistered(botToken, args.chatId, args.lang);
            return;
        }

        await this.upsertLink(tenant.id, { ...args, userId: user.id, verified: false });
        await this.bot.sendMessage(
            botToken,
            args.chatId,
            t(args.lang, 'confirmPhoneBelongsTo', user.firstName),
        );
    }

    private async handlePasswordAttempt(
        tenant: Tenant,
        link: { id: string; verifyAttempts: number; user: { id: string; firstName: string; password: string } },
        message: TelegramMessage,
        lang: BotLanguage,
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
            await this.bot.sendMiniAppButton(botToken, chatId, link.user.firstName, lang);
            return;
        }

        const attempts = link.verifyAttempts + 1;
        if (attempts >= MAX_PASSWORD_ATTEMPTS) {
            await this.rawPrisma.telegramLink.delete({ where: { id: link.id } });
            this.logger.warn(`Too many failed password attempts for tenant ${tenant.id}, telegram user ${message.from!.id}`);
            await this.bot.sendPhoneRequest(botToken, chatId, lang);
            await this.bot.sendMessage(botToken, chatId, t(lang, 'tooManyAttempts'));
            return;
        }

        await this.rawPrisma.telegramLink.update({
            where: { id: link.id },
            data: { verifyAttempts: attempts },
        });
        await this.bot.sendMessage(botToken, chatId, t(lang, 'wrongPassword', MAX_PASSWORD_ATTEMPTS - attempts));
    }

    // Phone is globally unique, so the lookup itself is cross-tenant; the
    // user must still belong to the tenant that owns this bot.
    private async findPortalUser(tenant: Tenant, phone: string) {
        const user = await this.rawPrisma.users.findUnique({ where: { phone } });
        const isMiniAppRole = user?.role === UserRole.PARENT || user?.role === UserRole.STUDENT
            || user?.role === UserRole.ADMIN || user?.role === UserRole.TEACHER;
        if (!user || user.tenantId !== tenant.id || !isMiniAppRole) {
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

    private async sendNotRegistered(botToken: string, chatId: string, lang: BotLanguage) {
        await this.bot.sendMessage(botToken, chatId, t(lang, 'notRegistered'));
    }
}

import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from 'src/lib/config';

const DEFAULT_TELEGRAM_API_BASE = 'https://api.telegram.org';

export interface TelegramBotInfo {
    id: number;
    username: string;
    first_name: string;
}

// Thin client over the Telegram Bot API. Bots are per-tenant, so every call
// takes the tenant's bot token explicitly - no client instances are cached.
@Injectable()
export class TelegramBotService {
    private readonly logger = new Logger(TelegramBotService.name);

    constructor(private readonly config: AppConfig) { }

    async callApi<T = unknown>(botToken: string, method: string, payload: Record<string, unknown> = {}): Promise<T> {
        const apiBase = this.config.TELEGRAM_API_BASE ?? DEFAULT_TELEGRAM_API_BASE;
        const response = await fetch(`${apiBase}/bot${botToken}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const body = await response.json() as { ok: boolean; result?: T; description?: string };
        if (!body.ok) {
            throw new Error(`Telegram API ${method} failed: ${body.description ?? 'unknown error'}`);
        }
        return body.result as T;
    }

    async getMe(botToken: string): Promise<TelegramBotInfo> {
        return this.callApi<TelegramBotInfo>(botToken, 'getMe');
    }

    async setWebhook(botToken: string, url: string, secretToken: string) {
        return this.callApi(botToken, 'setWebhook', {
            url,
            secret_token: secretToken,
            allowed_updates: ['message'],
        });
    }

    // Passwords are typed into the chat during verification; removing the
    // message keeps them out of the visible history. Best-effort - bots can
    // delete user messages in private chats for 48h.
    async deleteMessage(botToken: string, chatId: string, messageId: number) {
        try {
            await this.callApi(botToken, 'deleteMessage', { chat_id: chatId, message_id: messageId });
        } catch (error) {
            this.logger.warn(`Could not delete message ${messageId} in chat ${chatId}`);
        }
    }

    async sendMessage(botToken: string, chatId: string, text: string, replyMarkup?: Record<string, unknown>) {
        return this.callApi(botToken, 'sendMessage', {
            chat_id: chatId,
            text,
            ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
        });
    }

    async sendPhoneRequest(botToken: string, chatId: string) {
        return this.sendMessage(
            botToken,
            chatId,
            'Welcome! To connect your account, share your phone number with the button below, or type it like +998901234567.',
            {
                keyboard: [[{ text: '📱 Share my phone number', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
            },
        );
    }

    // Removes the contact keyboard, then sends the mini-app launch button.
    // Two messages because remove_keyboard and inline_keyboard cannot be
    // combined in a single reply_markup.
    async sendMiniAppButton(botToken: string, chatId: string, firstName: string) {
        const miniAppUrl = this.config.MINI_APP_URL;
        if (!miniAppUrl) {
            this.logger.warn('MINI_APP_URL is not configured - sending confirmation without the mini app button');
            await this.sendMessage(botToken, chatId, `You are connected, ${firstName}! The app will be available here soon.`, {
                remove_keyboard: true,
            });
            return;
        }
        await this.sendMessage(botToken, chatId, `You are connected, ${firstName}! ✅`, { remove_keyboard: true });
        await this.sendMessage(botToken, chatId, 'Tap the button below to open the app:', {
            inline_keyboard: [[{ text: '🚀 Open App', web_app: { url: miniAppUrl } }]],
        });
    }
}

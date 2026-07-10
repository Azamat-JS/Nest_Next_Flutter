import { Module } from '@nestjs/common';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramLinkService } from './telegram-link.service';

@Module({
    controllers: [TelegramWebhookController],
    providers: [TelegramBotService, TelegramLinkService],
    exports: [TelegramBotService],
})
export class TelegramModule { }

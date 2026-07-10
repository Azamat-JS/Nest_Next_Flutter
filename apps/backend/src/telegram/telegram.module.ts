import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigifyModule } from '@itgorillaz/configify';
import { AppConfig } from 'src/lib/config';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { TelegramAuthController } from './telegram-auth.controller';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramLinkService } from './telegram-link.service';
import { TelegramAuthService } from './telegram-auth.service';

@Module({
    imports: [
        ConfigifyModule.forRootAsync(),
        JwtModule.registerAsync({
            inject: [AppConfig],
            useFactory: (config: AppConfig) => ({
                secret: config.JWT_SECRET,
                signOptions: { expiresIn: config.JWT_EXPIRES_IN },
            }),
        }),
    ],
    controllers: [TelegramWebhookController, TelegramAuthController],
    providers: [TelegramBotService, TelegramLinkService, TelegramAuthService],
    exports: [TelegramBotService],
})
export class TelegramModule { }

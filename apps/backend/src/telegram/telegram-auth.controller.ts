import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from 'src/lib/shared/decorators/public';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Controller('telegram')
export class TelegramAuthController {
    constructor(private readonly authService: TelegramAuthService) { }

    // Public + validates one HMAC per tenant, so keep brute force off it.
    @UseGuards(ThrottlerGuard)
    @Throttle({ default: { ttl: 60_000, limit: 10 } })
    @Public()
    @Post('auth')
    @HttpCode(200)
    async authenticate(@Body() dto: TelegramAuthDto) {
        return this.authService.authenticate(dto.initData);
    }
}

import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Public } from 'src/lib/shared/decorators/public';
import { TelegramAuthService } from './telegram-auth.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

@Controller('telegram')
export class TelegramAuthController {
    constructor(private readonly authService: TelegramAuthService) { }

    @Public()
    @Post('auth')
    @HttpCode(200)
    async authenticate(@Body() dto: TelegramAuthDto) {
        return this.authService.authenticate(dto.initData);
    }
}

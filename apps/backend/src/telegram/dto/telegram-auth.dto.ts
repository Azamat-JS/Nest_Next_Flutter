import { IsNotEmpty, IsString } from 'class-validator';

export class TelegramAuthDto {
    // Raw window.Telegram.WebApp.initData query string, passed through untouched.
    @IsNotEmpty()
    @IsString()
    initData!: string;
}

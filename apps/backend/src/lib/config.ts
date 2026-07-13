import { Configuration, Value } from "@itgorillaz/configify";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";



@Configuration()
export class AppConfig {
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @Value("PORT")
    PORT!: number;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @Value("JWT_EXPIRES_IN")
    JWT_EXPIRES_IN!: number;

    @IsNotEmpty()
    @IsString()
    @Value("JWT_SECRET")
    JWT_SECRET!: string;

    @IsNotEmpty()
    @IsString()
    @Value("REFRESH_TOKEN_EXPIRES_IN")
    REFRESH_TOKEN_EXPIRES_IN!: string;

    @IsNotEmpty()
    @IsString()
    @Value("DATABASE_URL")
    DATABASE_URL!: string;

    // Public HTTPS base URL of this backend - Telegram delivers webhook
    // updates here, so it must be reachable from the internet.
    @IsOptional()
    @IsString()
    @Value("API_PUBLIC_URL")
    API_PUBLIC_URL?: string;

    // HTTPS URL of the Telegram mini app (the frontend /tg entry page).
    @IsOptional()
    @IsString()
    @Value("MINI_APP_URL")
    MINI_APP_URL?: string;

    // Override for tests/mocks only; defaults to the real Bot API.
    @IsOptional()
    @IsString()
    @Value("TELEGRAM_API_BASE")
    TELEGRAM_API_BASE?: string;

    // Synced into the PlatformAdmin table on every boot - see PlatformAdminService.onModuleInit.
    @IsOptional()
    @IsString()
    @Value("SUPERADMIN_PHONE")
    SUPERADMIN_PHONE?: string;

    @IsOptional()
    @IsString()
    @Value("SUPERADMIN_PASSWORD")
    SUPERADMIN_PASSWORD?: string;
}
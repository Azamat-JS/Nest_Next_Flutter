import { Configuration, Value } from "@itgorillaz/configify";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";



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

    @IsNotEmpty()
    @IsString()
    @Value("FIREBASE_PROJECT_ID")
    FIREBASE_PROJECT_ID!: string;

    @IsNotEmpty()
    @IsString()
    @Value("FIREBASE_CLIENT_EMAIL")
    FIREBASE_CLIENT_EMAIL!: string;

    @IsNotEmpty()
    @IsString()
    @Value("FIREBASE_PRIVATE_KEY")
    FIREBASE_PRIVATE_KEY!: string;
}
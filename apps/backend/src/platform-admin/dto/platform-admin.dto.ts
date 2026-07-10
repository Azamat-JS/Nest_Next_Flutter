import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { TenantStatus } from '@prisma/client';

export class PlatformAdminLoginDto {
    @IsNotEmpty()
    @IsString()
    phone!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}

export class CreateTenantDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    ownerFirstName!: string;

    @IsOptional()
    @IsString()
    ownerLastName?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'ownerPhone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    ownerPhone!: string;

    @IsNotEmpty()
    @IsString()
    ownerPassword!: string;

    @IsOptional()
    @IsString()
    botToken?: string;
}

export class SetTenantBotDto {
    @IsNotEmpty()
    @IsString()
    botToken!: string;
}

export class UpdateTenantStatusDto {
    @IsNotEmpty()
    @IsEnum(TenantStatus)
    @Transform(({ value }) => value?.toUpperCase())
    status!: TenantStatus;
}

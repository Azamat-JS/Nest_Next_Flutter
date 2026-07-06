import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    firstName!: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'phone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    phone!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    @Transform(({ value }) => value?.toUpperCase())
    role!: UserRole;
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'phone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEnum(UserRole)
    @Transform(({ value }) => value?.toUpperCase())
    role!: UserRole;
}

export class LoginDto {

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'phone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    phone!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsOptional()
    @IsString()
    deviceInfo?: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    currentPassword!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    newPassword!: string;
}

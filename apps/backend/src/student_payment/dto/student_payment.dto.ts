import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";

export class StudentPaymentDto {
    @IsInt()
    @IsNotEmpty()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month!: number;

    @IsInt()
    @IsNotEmpty()
    year!: number;
    @Type(() => Number)

    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    @Type(() => Number)
    amount!: number;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class UpdatePaymentDto {
    @IsInt()
    @IsOptional()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    month?: number;

    @IsInt()
    @IsOptional()
    @Type(() => Number)
    year?: number;

    @IsOptional()
    @IsPositive()
    @Type(() => Number)
    amount?: number;

    @IsOptional()
    @IsString()
    comment?: string;
}
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from "class-validator";
import { PaginationDto } from "src/lib/shared/dto/pagination.dto";
import { PaymentMethod } from "@prisma/client";

export class LatestPaymentsQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    groupId?: string;
}

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

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    paymentMethod!: PaymentMethod;

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
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsString()
    comment?: string;
}
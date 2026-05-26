import { Type } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class StudentPaymentDto {
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    month!: number;

    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    year!: number;

    @IsNotEmpty()
    @Type(() => Number)
    amount!: number;

    @IsOptional()
    @IsString()
    comment?: String;
}
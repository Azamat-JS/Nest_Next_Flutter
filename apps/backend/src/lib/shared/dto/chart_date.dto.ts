import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class ChartDateDto {
    @IsNotEmpty()
    @IsInt()
    year!: number;

    @IsNotEmpty()
    @IsInt()
    month!: number;
}
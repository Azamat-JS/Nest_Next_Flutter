import { IsInt, IsOptional } from "class-validator";

export class ChartDateDto {
    @IsOptional()
    @IsInt()
    year?: number;

    @IsOptional()
    @IsInt()
    month?: number;
}
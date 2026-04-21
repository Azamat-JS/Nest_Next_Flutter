import { ScoreType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ScoreDto {
    @IsNotEmpty()
    @IsString()
    studentId!: string;

    @IsNotEmpty()
    @IsString()
    groupId!: string;

    @IsNotEmpty()
    @IsEnum(ScoreType)
    @Transform(({ value }) => value?.toUpperCase())
    scoreType!: ScoreType;

    @IsNotEmpty()
    @IsInt()
    score!: number;

    @IsOptional()
    @IsString()
    date!: string;
}

export class UpdateScoreDto {
    @IsNotEmpty()
    @IsString()
    date!: string;

    @IsNotEmpty()
    @IsEnum(ScoreType)
    @Transform(({ value }) => value?.toUpperCase())
    type!: ScoreType;

    @IsNotEmpty()
    @IsInt()
    value!: number;
}

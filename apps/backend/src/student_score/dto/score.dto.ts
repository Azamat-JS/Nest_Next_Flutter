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
    @IsDate()
    date!: Date;

    @IsOptional()
    @IsString()
    comment?: string;
}

export class UpdateScoreDto {
    @IsDate()
    date!: Date;

    @IsNotEmpty()
    @IsEnum(ScoreType)
    @Transform(({ value }) => value?.toUpperCase())
    type!: ScoreType;

    @IsNotEmpty()
    @IsInt()
    value!: number;

    @IsOptional()
    @IsString()
    comment?: string;
}

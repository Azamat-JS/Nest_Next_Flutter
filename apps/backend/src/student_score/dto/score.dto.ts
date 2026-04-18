import { ScoreType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";

export class AddScoreDto {
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
}

export class UpdateScoreDto {
    @IsNotEmpty()
    @IsEnum(ScoreType)
    @Transform(({ value }) => value?.toUpperCase())
    scoreType!: ScoreType;

    @IsNotEmpty()
    @IsInt()
    score!: number;
}
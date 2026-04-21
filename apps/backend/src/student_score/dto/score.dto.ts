import { ScoreType } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

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
}

export class UpdateScoreDto {
    @IsOptional()
    @IsInt()
    homeworkScore?: number;

    @IsOptional()
    @IsInt()
    attendanceScore?: number;
}

import { ScoreType } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AddScoreDto {
    @IsNotEmpty()
    @IsString()
    studentId!: string;

    @IsNotEmpty()
    @IsString()
    groupId!: string;

    @IsNotEmpty()
    @IsEnum(ScoreType)
    scoreType!: ScoreType;


}
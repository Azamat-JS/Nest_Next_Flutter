import { ScoreType } from "@prisma/client";
import { IsArray, IsEnum, IsInt, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class StudentScoreItem {
    @IsString()
    studentId!: string;

    @IsInt()
    score!: number;
}

export class BulkScoreDto {
    @IsString()
    groupId!: string;

    @IsEnum(ScoreType)
    scoreType!: ScoreType;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => StudentScoreItem)
    students!: StudentScoreItem[];
}
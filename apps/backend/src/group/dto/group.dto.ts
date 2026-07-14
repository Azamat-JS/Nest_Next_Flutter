import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min, ValidateNested } from "class-validator";

export class LessonScheduleDto {
    // ISO-8601 day: 1 = Monday ... 7 = Sunday
    @IsInt()
    @Min(1)
    @Max(7)
    dayOfWeek!: number;

    @IsString()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'time must be in HH:mm format' })
    time!: string;
}

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    teacherId!: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    studentIds?: string[];

    @IsOptional()
    @IsArray()
    @ArrayUnique((schedule: LessonScheduleDto) => schedule.dayOfWeek)
    @ValidateNested({ each: true })
    @Type(() => LessonScheduleDto)
    lessonSchedules?: LessonScheduleDto[];
}

export class UpdateGroupDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    teacherId?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique((schedule: LessonScheduleDto) => schedule.dayOfWeek)
    @ValidateNested({ each: true })
    @Type(() => LessonScheduleDto)
    lessonSchedules?: LessonScheduleDto[];
}

export class AddStudentsDto {
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    studentIds?: string[];
}

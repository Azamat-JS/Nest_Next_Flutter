import { IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "src/lib/shared/dto/pagination.dto";

export class CreateHomeworkDto {
    @IsNotEmpty()
    @IsString()
    groupId!: string;

    @IsNotEmpty()
    @IsString()
    topic!: string;

    @IsNotEmpty()
    @IsDate()
    dueDate!: Date;

    // Calendar date ("yyyy-MM-dd") of the scheduled lesson this homework
    // belongs to; must land on one of the group's scheduled weekdays within
    // the current or previous week.
    @IsOptional()
    @IsDate()
    lessonDate?: Date;
}

export class HomeworkQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;
}

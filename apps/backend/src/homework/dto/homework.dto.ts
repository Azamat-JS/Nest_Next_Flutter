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
}

export class HomeworkQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;
}

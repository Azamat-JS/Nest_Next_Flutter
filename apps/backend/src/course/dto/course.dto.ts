import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateCourseDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name!: string;

    @IsNumber()
    @Min(0)
    price!: number;

    @IsInt()
    @Min(1)
    @Max(60)
    durationMonths!: number;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
}

export class UpdateCourseDto extends CreateCourseDto { }

import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

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
    @ArrayUnique()
    @IsString({ each: true })
    studentIds?: string[];
}


export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    limit?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    page?: number;
}
import { ArrayUnique, IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateGroupDto {
    @IsNotEmpty()
    @IsString()
    name!: string;
}

export class UpdateGroupDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    addStudentIds?: string[];

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    removeStudentIds?: string[];

}

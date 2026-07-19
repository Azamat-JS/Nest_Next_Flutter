import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateHolidayDto {
    @IsDateString()
    date!: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(200)
    reason!: string;
}

export class UpdateHolidayDto extends CreateHolidayDto { }

import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';

export class CreateWaitingListDto {
    @IsNotEmpty()
    @IsString()
    firstName!: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'phone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    phone!: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class UpdateWaitingListDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+998\d{9}$/, {
        message: 'phone must be a valid Uzbekistan phone number in the format +998XXXXXXXXX',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    reason?: string;
}

export class GetWaitingListQueryDto extends PaginationDto {
    @IsOptional()
    @IsString()
    search?: string;
}

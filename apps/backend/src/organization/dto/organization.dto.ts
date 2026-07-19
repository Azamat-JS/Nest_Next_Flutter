import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const TIME_24H = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateOrganizationDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name?: string;

    // Logo stored inline as a data URL; capped so it fits the JSON body limit.
    @IsOptional()
    @IsString()
    @Matches(/^data:image\/(png|jpe?g|webp|svg\+xml);base64,/, {
        message: 'logoUrl must be a base64 image data URL',
    })
    @MaxLength(90_000)
    logoUrl?: string;

    @IsOptional()
    @IsString()
    @Matches(TIME_24H, { message: 'workStartTime must be in HH:mm format' })
    workStartTime?: string;

    @IsOptional()
    @IsString()
    @Matches(TIME_24H, { message: 'workEndTime must be in HH:mm format' })
    workEndTime?: string;
}

export class CreateBranchDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name!: string;
}

export class UpdateBranchDto extends CreateBranchDto { }

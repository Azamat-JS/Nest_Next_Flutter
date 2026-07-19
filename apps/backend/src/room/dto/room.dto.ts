import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRoomDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(60)
    name!: string;
}

export class UpdateRoomDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(60)
    name!: string;
}

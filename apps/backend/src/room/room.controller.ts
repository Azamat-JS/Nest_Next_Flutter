import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('all')
    findAll() {
        return this.roomService.findAll();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post()
    create(@Body() dto: CreateRoomDto) {
        return this.roomService.create(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
        return this.roomService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.roomService.remove(id);
    }
}

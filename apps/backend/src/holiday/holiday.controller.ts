import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('holiday')
export class HolidayController {
    constructor(private readonly holidayService: HolidayService) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('all')
    findAll() {
        return this.holidayService.findAll();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post()
    create(@Body() dto: CreateHolidayDto) {
        return this.holidayService.create(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
        return this.holidayService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.holidayService.remove(id);
    }
}

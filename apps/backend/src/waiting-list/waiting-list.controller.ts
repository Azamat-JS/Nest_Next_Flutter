import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';
import { CreateWaitingListDto, GetWaitingListQueryDto, UpdateWaitingListDto } from './dto/waiting-list.dto';
import { Roles } from 'src/lib/shared/decorators/roles';
import { RolesGuard } from 'src/lib/guards/roles.guard';

@Controller('waiting-list')
export class WaitingListController {
    constructor(private readonly waitingListService: WaitingListService) { }

    @Get()
    async getAll(@Query() query: GetWaitingListQueryDto) {
        return this.waitingListService.getAll(query);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Post()
    async create(@Body() dto: CreateWaitingListDto) {
        return this.waitingListService.create(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateWaitingListDto) {
        return this.waitingListService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.waitingListService.delete(id);
    }
}

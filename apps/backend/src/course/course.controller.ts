import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) { }

    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'TEACHER')
    @Get('all')
    findAll() {
        return this.courseService.findAll();
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Post()
    create(@Body() dto: CreateCourseDto) {
        return this.courseService.create(dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
        return this.courseService.update(id, dto);
    }

    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.courseService.remove(id);
    }
}

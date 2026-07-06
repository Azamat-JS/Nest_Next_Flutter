import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { AddStudentsDto, CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { CreateGroupUseCase, UpdateGroupUseCase, RemoveStudentFromGroupUseCase } from './usecases';
import { AddStudentUseCase } from './usecases/add-student-usecase';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupRepository, private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly addStudentUseCase: AddStudentUseCase,
    private readonly removeStudentFromGroupUseCase: RemoveStudentFromGroupUseCase,
  ) { }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.createGroupUseCase.execute(createGroupDto);
  }

  @Get('all')
  findAll(@Query() query: PaginationDto) {
    return this.groupService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @Get(':id/students')
  findGroupStudents(@Param('id') id: string, @Query() query: PaginationDto) {
    return this.groupService.findGroupStudents(id, query.page, query.limit);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post(":id/add-students")
  addStudents(@Param('id') id: string, @Body() body: AddStudentsDto) {
    return this.addStudentUseCase.execute(id, body);
  }


  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Put(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.updateGroupUseCase.execute(id, updateGroupDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Delete("delete/:studentId/:groupId")
  async deleteStudent(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    return this.removeStudentFromGroupUseCase.execute(studentId, groupId);
  }


  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}

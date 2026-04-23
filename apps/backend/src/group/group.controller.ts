import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { AddStudentsDto, CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from 'src/lib/guards/jwt.guard';
import { CreateGroupUseCase, UpdateGroupUseCase, RemoveStudentFromGroupUseCase } from './usecases';
import { AddStudentUseCase } from './usecases/add-student-usecase';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupRepository, private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly addStudentUseCase: AddStudentUseCase,
    private readonly removeStudentFromGroupUseCase: RemoveStudentFromGroupUseCase,
  ) { }

  @UseGuards(JwtAuthGuard)
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

  @Post(":id/add-students")
  addStudents(@Param('id') id: string, @Body() body: AddStudentsDto) {
    return this.addStudentUseCase.execute(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.updateGroupUseCase.execute(id, updateGroupDto);
  }

  @Delete("delete/:studentId/:groupId")
  async deleteStudent(@Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    return this.removeStudentFromGroupUseCase.execute(studentId, groupId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}

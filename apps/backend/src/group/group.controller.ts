import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query, Req, ForbiddenException } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { AddStudentsDto, CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { CreateGroupUseCase, UpdateGroupUseCase, RemoveStudentFromGroupUseCase } from './usecases';
import { AddStudentUseCase } from './usecases/add-student-usecase';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { RolesGuard } from 'src/lib/guards/roles.guard';
import { Roles } from 'src/lib/shared/decorators/roles';
import { PortalAccessService } from 'src/portal/portal-access.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupRepository, private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
    private readonly addStudentUseCase: AddStudentUseCase,
    private readonly removeStudentFromGroupUseCase: RemoveStudentFromGroupUseCase,
    private readonly portalAccess: PortalAccessService,
  ) { }

  private assertCanManageGroup(req, group: { teacherId: string }) {
    const { role, userId } = req.user;
    if (role === 'ADMIN') return;
    if (role === 'TEACHER' && group.teacherId === userId) return;
    throw new ForbiddenException('You do not have permission to manage this group');
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.createGroupUseCase.execute(createGroupDto);
  }

  @Get('all')
  findAll(@Req() req, @Query() query: PaginationDto) {
    return this.groupService.findAll(query, req.user);
  }

  @Get(':id')
  async findOne(@Req() req, @Param('id') id: string) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, id);
    }
    const group = await this.groupService.findOne(id);
    if (req.user.role === 'TEACHER') {
      this.assertCanManageGroup(req, group);
    }
    return group;
  }

  @Get(':id/students')
  async findGroupStudents(@Req() req, @Param('id') id: string, @Query() query: PaginationDto) {
    if (req.user.role === 'STUDENT') {
      await this.portalAccess.assertCanViewGroup(req.user, id);
    }
    if (req.user.role === 'TEACHER') {
      const group = await this.groupService.findOne(id);
      this.assertCanManageGroup(req, group);
    }
    return this.groupService.findGroupStudents(id, query.page, query.limit);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Post(":id/add-students")
  async addStudents(@Req() req, @Param('id') id: string, @Body() body: AddStudentsDto) {
    const group = await this.groupService.findOne(id);
    this.assertCanManageGroup(req, group);
    return this.addStudentUseCase.execute(id, body);
  }


  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Put(':id')
  async update(@Req() req, @Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    const group = await this.groupService.findOne(id);
    this.assertCanManageGroup(req, group);
    if (updateGroupDto.teacherId && updateGroupDto.teacherId !== group.teacherId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can reassign a group to another teacher');
    }
    return this.updateGroupUseCase.execute(id, updateGroupDto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'TEACHER')
  @Delete("delete/:studentId/:groupId")
  async deleteStudent(@Req() req, @Param('studentId') studentId: string, @Param('groupId') groupId: string) {
    const group = await this.groupService.findOne(groupId);
    this.assertCanManageGroup(req, group);
    return this.removeStudentFromGroupUseCase.execute(studentId, groupId);
  }


  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}

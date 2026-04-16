import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, Query } from '@nestjs/common';
import { GroupRepository } from './group.service';
import { CreateGroupDto, PaginationDto, UpdateGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from 'src/lib/guards/jwt.guard';
import { CreateGroupUseCase } from './usecases';
import { UpdateGroupUseCase } from './usecases/update-group.usecase';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupRepository, private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly updateGroupUseCase: UpdateGroupUseCase,
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
    console.log(id)
    return this.groupService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.updateGroupUseCase.execute(id, updateGroupDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createGroupDto: CreateGroupDto, teacherId: string) {
    const teacher = await this.prisma.users.findUnique({ where: { id: teacherId, role: 'teacher' } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }
    const newGroup = await this.prisma.groups.create({
      data: {
        ...createGroupDto,
        teacherId: teacherId
      }
    });

    return newGroup;
  }

  findAll() {
    return `This action returns all group`;
  }

  findOne(id: string) {
    return `This action returns a #${id} group`;
  }

  update(id: string, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group`;
  }

  remove(id: string) {
    return `This action removes a #${id} group`;
  }
}

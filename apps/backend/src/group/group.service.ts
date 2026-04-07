import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createGroupDto: CreateGroupDto, teacherId: string) {
    const teacher = await this.prisma.users.findFirst({ where: { id: teacherId, role: 'teacher' } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }
    const newGroup = await this.prisma.groups.create({
      data: {
        name: createGroupDto.name,
        teacher: {
          connect: { id: teacherId }
        }
      }
    });

    return newGroup;
  }

  async findAll() {
    return await this.prisma.groups.findMany({
      select: {
        name: true,
        teacherId: true,
        createdAt: true,
        teacher: {
          select: {
            username: true
          }
        }
      }
    })
  }

  async findOne(id: string) {
    const group = await this.prisma.groups.findFirst({
      where: { id },
      select: {
        name: true,
        teacherId: true,
        createdAt: true,
        teacher: {
          select: {
            username: true,
          }
        }
      }
    })
    if (!group) {
      throw new NotFoundException(
        'Group not found'
      )
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto) {

    const group = await this.prisma.groups.findUnique({ where: { id } });
    if (!group) throw new NotFoundException('Group not found')

    return await this.prisma.groups.update({
      where: { id }, data: updateGroupDto,
    });

  }

  async remove(id: string) {
    const group = await this.prisma.groups.findUnique({ where: { id } });
    if (!group) throw new NotFoundException(
      'Group not found'
    )
    await this.prisma.groups.delete({ where: { id } });
    return { message: 'Group deleted successfully!' }
  }
}

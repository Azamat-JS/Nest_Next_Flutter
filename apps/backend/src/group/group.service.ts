import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto/group.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createGroupDto: CreateGroupDto) {
    const teacher = await this.prisma.users.findFirst({ where: { id: createGroupDto.teacherId, role: 'teacher' } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }
    const studentIds = createGroupDto.studentIds?.filter(Boolean) ?? [];
    const newGroup = await this.prisma.groups.create({
      data: {
        name: createGroupDto.name,
        teacher: {
          connect: { id: createGroupDto.teacherId }
        },
        ...(studentIds?.length > 0 && {
          students: {
            connect: studentIds.map((id) => ({
              id
            }))
          }
        })
      }
    });

    return newGroup;
  }

  async findAll() {
    return await this.prisma.groups.findMany({
      select: {
        id: true,
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
        id: true,
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
    const group = await this.prisma.groups.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (updateGroupDto.teacherId) {
      const teacher = await this.prisma.users.findFirst({
        where: { id: updateGroupDto.teacherId, role: 'teacher' }
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found')
      }
    }

    return await this.prisma.groups.update({
      where: { id },
      data: {
        ...(updateGroupDto.name && {
          name: updateGroupDto.name,
        }),

        ...(updateGroupDto.teacherId && {
          teacher: {
            connect: {
              id: updateGroupDto.teacherId,
            },
          },
        }),

        ...((updateGroupDto.addStudentIds?.length ||
          updateGroupDto.removeStudentIds?.length) && {
          students: {
            ...(updateGroupDto.addStudentIds?.length && {
              connect: updateGroupDto.addStudentIds.map((studentId) => ({
                id: studentId,
              })),
            }),

            ...(updateGroupDto.removeStudentIds?.length && {
              disconnect: updateGroupDto.removeStudentIds.map((studentId) => ({
                id: studentId,
              })),
            }),
          },
        }),
      },
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

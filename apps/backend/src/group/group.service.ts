import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, PaginationDto, UpdateGroupDto } from './dto/group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) { }
  async create(createGroupDto: CreateGroupDto) {
    const teacher = await this.prisma.users.findFirst({ where: { id: createGroupDto.teacherId, role: UserRole.TEACHER } });
    if (!teacher) {
      throw new NotFoundException('Teacher not found')
    }
    const studentIds = createGroupDto.studentIds?.filter(Boolean) ?? [];

    const newGroup = await this.prisma.$transaction(async (tx) => {
      const newGroup = await tx.groups.create({
        data: {
          name: createGroupDto.name,
          teacher: {
            connect: { id: createGroupDto.teacherId }
          },
        }
      });

      if (studentIds.length > 0) {
        await tx.studentGroup.createMany({
          data: studentIds.map((studentId) => ({
            studentId,
            groupId: newGroup.id,
          }))
        })
      }

    })

    return newGroup;
  }

  async findAll(query: PaginationDto) {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.groups.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          teacherId: true,
          createdAt: true,
          teacher: {
            select: {
              id: true,
              username: true
            }
          },
          students: {
            select: {
              student: {
                select: {
                  id: true,
                  username: true,
                  email: true
                }
              }
            }
          },
        },
      }),
      this.prisma.groups.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        limit,
      }
    }
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
            id: true,
            username: true,
          }
        },
        students: {
          select: {
            student: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
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
    const studentIds = updateGroupDto.studentIds?.filter(Boolean) ?? [];
    const group = await this.prisma.groups.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (updateGroupDto.teacherId) {
      const teacher = await this.prisma.users.findFirst({
        where: { id: updateGroupDto.teacherId, role: UserRole.TEACHER },
        select: {
          id: true,
          username: true,
        }
      })

      if (!teacher) {
        throw new NotFoundException('Teacher not found')
      }
    }

    const students = await this.prisma.users.findMany({
      where: {
        id: { in: studentIds },
        role: UserRole.STUDENT,
      },
      select: { id: true }
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException('Some students not found or invalid');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.groups.update({
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

          ...(studentIds && {
          }),
        },
      });

      await tx.studentGroup.deleteMany({
        where: { groupId: id }
      });

      if (studentIds.length) {
        await tx.studentGroup.createMany({
          data: studentIds.map((studentId) => ({
            studentId,
            groupId: id,
          }))
        })
      }
    })
    return this.findOne(id);
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

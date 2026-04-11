import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto, PaginationDto, UpdateGroupDto } from './dto/group.dto';
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

  async findAll(query: PaginationDto) {
    const { limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      await this.prisma.groups.findMany({
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
              id: true,
              username: true,
              email: true
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
            id: true,
            username: true,
            email: true
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

        ...(updateGroupDto.studentIds && {
          students: {
            set: updateGroupDto.studentIds.map((id) => ({ id })),
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

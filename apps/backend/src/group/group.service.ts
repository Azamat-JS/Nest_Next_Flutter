import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { Prisma, UserRole } from '@prisma/client';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';

@Injectable()
export class GroupRepository {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient) { }
  async createGroup(tx: Prisma.TransactionClient, data: Prisma.GroupsCreateInput) {
    return tx.groups.create({ data });
  }

  async createStudentGroup(tx: Prisma.TransactionClient, data: Prisma.StudentGroupCreateManyInput[]) {
    return tx.studentGroup.createMany({ data })
  }

  async findTeacherById(id: string) {
    return this.prisma.users.findFirst({
      where: { id, role: UserRole.TEACHER }
    });
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
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
            }
          },
          students: {
            select: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  phone: true,
                  role: true,
                }
              }
            }
          },
        },
      }),
      this.prisma.groups.count(),
    ]);

    return {
      data: data.map(group => ({
        ...group,
        students: group.students.map(s => s.student)
      })),
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        limit,
      }
    };
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
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
          }
        },
      }
    })
    if (!group) {
      throw new NotFoundException(
        'Group not found'
      )
    }
    return group;
  }

  async findGroupStudents(groupId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      this.prisma.studentGroup.findMany({
        where: { groupId },
        skip,
        take: limit,
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              role: true,
            }
          }
        }
      }),
      this.prisma.studentGroup.count({ where: { groupId } })
    ])
    return {
      data: students.map(s => s.student),
      meta: {
        total,
        page,
        last_page: Math.ceil(total / limit),
        limit,
      }
    }
  }

  async findStudentByIds(studentIds: string[]) {
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
    return students;
  }

  async update(tx: Prisma.TransactionClient, id: string, data: Prisma.GroupsUpdateInput) {
    await tx.groups.update({
      where: { id },
      data,
    });

  }

  async createStudents(tx: Prisma.TransactionClient, studentIds: string[], groupId: string) {
    return await tx.studentGroup.createMany({
      data: studentIds.map(id => ({ studentId: id, groupId })),
      skipDuplicates: true,
    })
  }

  async deleteStudent(tx: Prisma.TransactionClient, body: { studentId: string, groupId: string }) {
    const { studentId, groupId } = body;
    await tx.studentGroup.delete({
      where: {
        studentId_groupId: {
          studentId,
          groupId,
        }
      }
    })
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

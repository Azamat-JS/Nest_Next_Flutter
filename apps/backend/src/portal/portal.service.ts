import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { ChartDateDto } from 'src/lib/shared/dto/chart_date.dto';
import { GroupRepository } from 'src/group/group.service';
import { StudentScoreRepository } from 'src/student_score/student_score.service';
import { HomeworkRepository } from 'src/homework/homework.service';
import { HomeworkQueryDto } from 'src/homework/dto/homework.dto';
import { PortalAccessService, RequestUser } from './portal-access.service';

const groupSelect = {
    group: {
        select: {
            id: true,
            name: true,
            teacher: { select: { id: true, firstName: true, lastName: true } },
        },
    },
} as const;

@Injectable()
export class PortalService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly access: PortalAccessService,
        private readonly groupRepo: GroupRepository,
        private readonly scoreRepo: StudentScoreRepository,
        private readonly homeworkRepo: HomeworkRepository,
    ) { }

    // Everything the mini app needs to route on open: the profile plus the
    // groups to land on (own groups for students, children's for parents).
    async bootstrap(user: RequestUser) {
        const me = await this.prisma.users.findUnique({
            where: { id: user.userId },
            select: { id: true, firstName: true, lastName: true, phone: true, role: true, avatarUrl: true },
        });

        if (user.role === UserRole.STUDENT) {
            const memberships = await this.prisma.studentGroup.findMany({
                where: { studentId: user.userId },
                select: groupSelect,
            });
            return { role: user.role, me, groups: memberships.map((m) => m.group) };
        }

        // Admins have no "own" groups or children - they browse every group
        // in the tenant, same shape as the student branch above.
        if (user.role === UserRole.ADMIN) {
            const groups = await this.prisma.groups.findMany({
                select: groupSelect.group.select,
            });
            return { role: user.role, me, groups };
        }

        // Teachers browse the groups they teach, same shape again.
        if (user.role === UserRole.TEACHER) {
            const groups = await this.prisma.groups.findMany({
                where: { teacherId: user.userId },
                select: groupSelect.group.select,
            });
            return { role: user.role, me, groups };
        }

        const relations = await this.prisma.parentStudent.findMany({
            where: { parentId: user.userId },
            select: {
                student: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatarUrl: true,
                        studentGroups: { select: groupSelect },
                    },
                },
            },
        });

        return {
            role: user.role,
            me,
            children: relations.map(({ student }) => ({
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                avatarUrl: student.avatarUrl,
                groups: student.studentGroups.map((m) => m.group),
            })),
        };
    }

    async getGroupDetails(user: RequestUser, groupId: string, query: PaginationDto) {
        await this.access.assertCanViewGroup(user, groupId);
        const { page = 1, limit = 50 } = query;
        const [group, students] = await Promise.all([
            this.groupRepo.findOne(groupId),
            this.groupRepo.findGroupStudents(groupId, page, limit),
        ]);
        return { group, students };
    }

    async getGroupHomework(user: RequestUser, groupId: string, query: HomeworkQueryDto) {
        await this.access.assertCanViewGroup(user, groupId);
        return this.homeworkRepo.findByGroup(groupId, query);
    }

    async getGroupLeaderboard(user: RequestUser, groupId: string, query: PaginationDto) {
        await this.access.assertCanViewGroup(user, groupId);
        return this.scoreRepo.groupLeadeboard(groupId, query);
    }

    // Tenant-wide, visible to every linked parent and student by design.
    async getGlobalLeaderboard(query: PaginationDto) {
        return this.scoreRepo.leaderboard(query);
    }

    async getStudentScores(user: RequestUser, studentId: string, groupId: string, query: PaginationDto) {
        await this.access.assertCanViewStudent(user, studentId);
        return this.scoreRepo.findOneStudentScores(studentId, groupId, query);
    }

    async getStudentScoreChart(user: RequestUser, studentId: string, groupId: string, query: ChartDateDto) {
        await this.access.assertCanViewStudent(user, studentId);
        return this.scoreRepo.getScoreHistoryForChart(studentId, groupId, query);
    }

    // Students get their own history; parents get all of their children's,
    // each payment carrying the student it belongs to.
    async getPayments(user: RequestUser, query: PaginationDto) {
        const studentIds = await this.access.visibleStudentIds(user);
        const { page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;
        const where = studentIds ? { studentId: { in: studentIds } } : {};

        const [data, total] = await Promise.all([
            this.prisma.studentPayment.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ year: 'desc' }, { month: 'desc' }, { createdAt: 'desc' }],
                include: {
                    student: { select: { id: true, firstName: true, lastName: true } },
                    group: { select: { id: true, name: true } },
                },
            }),
            this.prisma.studentPayment.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            },
        };
    }
}

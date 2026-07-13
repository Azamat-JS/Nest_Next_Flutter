import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';

export interface RequestUser {
    userId: string;
    role: UserRole;
}

// Single source of truth for what each role may read: students see
// themselves and their own groups; parents see their children and the groups
// those children attend; teachers see the groups they teach and the students
// in them (read-only - this service never authorizes writes); admins pass
// everything.
@Injectable()
export class PortalAccessService {
    constructor(@Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient) { }

    async assertCanViewStudent(requester: RequestUser, studentId: string) {
        if (requester.role === UserRole.ADMIN) return;

        if (requester.role === UserRole.STUDENT) {
            if (studentId !== requester.userId) {
                throw new ForbiddenException('You can only view your own data');
            }
            return;
        }

        if (requester.role === UserRole.TEACHER) {
            const membership = await this.prisma.studentGroup.findFirst({
                where: { studentId, group: { teacherId: requester.userId } },
            });
            if (!membership) {
                throw new ForbiddenException('You can only view students in your own groups');
            }
            return;
        }

        const relation = await this.prisma.parentStudent.findFirst({
            where: { parentId: requester.userId, studentId },
        });
        if (!relation) {
            throw new ForbiddenException('You can only view your own children');
        }
    }

    async assertCanViewGroup(requester: RequestUser, groupId: string) {
        if (requester.role === UserRole.ADMIN) return;

        if (requester.role === UserRole.STUDENT) {
            const membership = await this.prisma.studentGroup.findFirst({
                where: { groupId, studentId: requester.userId },
            });
            if (!membership) {
                throw new ForbiddenException('You are not a member of this group');
            }
            return;
        }

        if (requester.role === UserRole.TEACHER) {
            const group = await this.prisma.groups.findFirst({
                where: { id: groupId, teacherId: requester.userId },
            });
            if (!group) {
                throw new ForbiddenException('You do not teach this group');
            }
            return;
        }

        const childMembership = await this.prisma.studentGroup.findFirst({
            where: {
                groupId,
                student: { parents: { some: { parentId: requester.userId } } },
            },
        });
        if (!childMembership) {
            throw new ForbiddenException('None of your children are in this group');
        }
    }

    // Which students' payments/scores the requester may see, for list
    // queries. Null means "no restriction" (admins see every student).
    async visibleStudentIds(requester: RequestUser): Promise<string[] | null> {
        if (requester.role === UserRole.STUDENT) {
            return [requester.userId];
        }
        if (requester.role === UserRole.ADMIN) {
            return null;
        }
        if (requester.role === UserRole.TEACHER) {
            const members = await this.prisma.studentGroup.findMany({
                where: { group: { teacherId: requester.userId } },
                select: { studentId: true },
            });
            return [...new Set(members.map((m) => m.studentId))];
        }
        const children = await this.prisma.parentStudent.findMany({
            where: { parentId: requester.userId },
            select: { studentId: true },
        });
        return children.map((c) => c.studentId);
    }
}

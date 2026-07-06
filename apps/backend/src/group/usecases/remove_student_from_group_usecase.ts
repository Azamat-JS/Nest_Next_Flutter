import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { GroupRepository } from "../group.service";
import { StudentScoreRepository } from "src/student_score/student_score.service";

@Injectable()
export class RemoveStudentFromGroupUseCase {
    constructor(
        private readonly groupRepo: GroupRepository,
        private readonly studentScoreRepo: StudentScoreRepository,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
    ) { }

    async execute(studentId: string, groupId: string) {
        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new NotFoundException('Student is not part of the group');
        }

        return this.prisma.$transaction(async (tx) => {
            await this.groupRepo.deleteStudent(tx, { studentId, groupId });
            return { message: 'Student removed from group' };
        })

    }
}
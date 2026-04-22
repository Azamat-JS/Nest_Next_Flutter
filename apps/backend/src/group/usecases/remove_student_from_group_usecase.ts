import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { GroupRepository } from "../group.service";
import { StudentScoreRepository } from "src/student_score/student_score.service";

@Injectable()
export class RemoveStudentFromGroupUseCase {
    constructor(
        private readonly groupRepo: GroupRepository,
        private readonly studentScoreRepo: StudentScoreRepository,
        private readonly prisma: PrismaService
    ) { }

    async execute(studentId: string, groupId: string) {
        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new NotFoundException('Student is not part of the group');
        }

        return this.prisma.$transaction(async (tx) => {
            await this.groupRepo.deleteStudent(tx, { studentId, groupId });
        })

    }
}
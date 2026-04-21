import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";

@Injectable()
export class RemoveStudentFromGroupUseCase {
    constructor(
        private readonly studentScoreRepo: StudentScoreRepository,
        private readonly prisma: PrismaService
    ) { }

    async execute(studentId: string, groupId: string) {
        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new NotFoundException('Student is not part of the group');
        }

        return this.prisma.$transaction(async (tx) => {
            await this.studentScoreRepo.deleteStudent(tx, { studentId, groupId });
        })

    }
}
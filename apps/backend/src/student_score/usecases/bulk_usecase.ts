import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { StudentScoreRepository } from "../student_score.service";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { BulkScoreDto } from "../dto/bulk.dto";

@Injectable()
export class BulkAddScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient) { }

    async execute(dto: BulkScoreDto) {
        const { groupId, scoreType, students } = dto;

        if (!students.length) {
            throw new BadRequestException('No students provided');
        }

        const studentIds = students.map(s => s.studentId);

        const studentGroups = await this.studentScoreRepo.findStudentsInGroup(groupId, studentIds);
        const studentGroupMap = new Map(studentGroups.map(sg => [sg.studentId, sg]));

        const todayScores = await this.studentScoreRepo.findTodayScoreWithType(studentIds, groupId, scoreType);

        const existingScoreSet = new Set(todayScores.map(s => s.studentId));

        const date = new Date();
        date.setHours(0, 0, 0, 0);

        for (const { studentId, score } of students) {
            if (score <= 0) {
                throw new BadRequestException('Score must be greater than 0');
            }

            if (!studentGroupMap.has(studentId)) {
                throw new BadRequestException('Student is not part of the group');
            }

            if (
                ['HOMEWORK', 'ATTENDANCE'].includes(scoreType) && existingScoreSet.has(studentId)
            ) {
                throw new BadRequestException('Score already exists for today');
            }
        }
        const data = students.map(({ score, studentId }) => ({
            studentId,
            groupId,
            type: scoreType,
            score,
            date,
            comment: null
        }));

        await this.prisma.$transaction(async (tx) => {
            for (const s of students) {
                await this.studentScoreRepo.addScore(tx, {
                    studentId: s.studentId,
                    groupId,
                    scoreType: scoreType,
                    score: s.score,
                    date,
                    comment: s.comment
                })
            }
        });

        return { count: data.length };
    }
}
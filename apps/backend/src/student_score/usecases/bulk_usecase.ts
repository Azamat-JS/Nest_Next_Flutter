import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentScoreRepository } from "../student_score.service";
import { PrismaService } from "src/prisma/prisma.service";
import { BulkScoreDto } from "../dto/bulk.dto";
import { ScoreType } from "@prisma/client/edge";

@Injectable()
export class BulkAddScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }

    async execute(dto: BulkScoreDto) {
        const { groupId, scoreType, students } = dto;

        return this.prisma.$transaction(async (tx) => {
            const results: any[] = [];

            for (const student of students) {
                const { studentId, score } = student;

                if (score <= 0) {
                    throw new BadRequestException('Score must be positive')
                }

                const restrictOncePerDayTypes = ["ATTENDANCE", "HOMEWORK"] as ScoreType[];

                if (restrictOncePerDayTypes.includes(scoreType)) {
                    const alreadyMarked = await this.studentScoreRepo.findTodayScore(studentId, groupId, scoreType);

                    if (alreadyMarked) {
                        throw new BadRequestException(`The student already has a ${scoreType.toLowerCase()} score for today`);
                    }
                }

                const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

                if (!studentGroup) {
                    throw new BadRequestException(`Student ${studentId} is not part of the group`);
                }

                const scoreDto = {
                    studentId,
                    groupId,
                    scoreType,
                    score,
                };

                const addedScore = await this.studentScoreRepo.addScore(tx, scoreDto);
                await this.studentScoreRepo.updateTotalScore(tx, scoreDto);
                results.push(addedScore);

            }
        })
    }
}
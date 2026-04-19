import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentScoreRepository } from "../student_score.service";
import { PrismaService } from "src/prisma/prisma.service";
import { BulkScoreDto } from "../dto/bulk.dto";

@Injectable()
export class BulkAddScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }

    async execute(dto: BulkScoreDto) {
        const { groupId, scoreType, students } = dto;

        return this.prisma.$transaction(async (tx) => {
            const results = [];

            for (const student of students) {
                const { studentId, score } = student;

                if (score <= 0) {
                    throw new BadRequestException('Score must be positive')
                }

                if (scoreType === 'ATTENDANCE') {
                    const alreadyMarked = await this.studentScoreRepo.findTodayAttendance(studentId, groupId);
                    if (alreadyMarked) {
                        throw new BadRequestException(`Attendance already marked for ${studentId}`);
                    }
                }
            }
        })
    }
}
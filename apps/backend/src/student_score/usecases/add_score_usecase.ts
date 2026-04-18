import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { ScoreDto } from "../dto/score.dto";

@Injectable()
export class AddScoreUseCase {
    constructor(private readonly prisma: PrismaService, private readonly studentScoreRepo: StudentScoreRepository) { }

    async execute(dto: ScoreDto) {
        const { studentId, groupId, scoreType, score } = dto;
        if (score <= 0) {
            throw new BadRequestException('Score must be positive');
        }

        if (scoreType === 'ATTENDANCE') {
            const alreadyMarked = await this.studentScoreRepo.findTodayAttendance(studentId, groupId);
            if (alreadyMarked) {
                throw new BadRequestException('Attendance already marked for today');
            }
        }
        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new BadRequestException('Student is not part of the group');
        }

        return await this.prisma.$transaction(async (tx) => {
            const addedScore = await this.studentScoreRepo.addScore(tx, dto);

            await this.studentScoreRepo.updateTotalScore(tx, dto);
            return addedScore;
        });
    }
}
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { ScoreDto } from "../dto/score.dto";
import { ScoreType } from "@prisma/client/index-browser";

@Injectable()
export class AddScoreUseCase {
    constructor(private readonly prisma: PrismaService, private readonly studentScoreRepo: StudentScoreRepository) { }

    async execute(dto: ScoreDto) {
        const { studentId, groupId, scoreType, score } = dto;
        if (score <= 0) {
            throw new BadRequestException('Score must be positive');
        }

        const restrictOncePerDayTypes = ["ATTENDANCE", "HOMEWORK"] as ScoreType[];

        if (restrictOncePerDayTypes.includes(scoreType)) {
            const alreadyMarked = await this.studentScoreRepo.findTodayAttendance(studentId, groupId, scoreType);

            if (alreadyMarked) {
                throw new BadRequestException(`The student already has a ${scoreType.toLowerCase()} score for today`);
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
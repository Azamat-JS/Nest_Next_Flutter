import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { UpdateScoreDto } from "../dto/score.dto";

@Injectable()
export class UpdateScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }
    async execute(dto: UpdateScoreDto, studentId: string, groupId: string) {
        const { type, value, date } = dto;

        if (value < 0) {
            throw new BadRequestException('Score must be non-negative');
        }

        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new BadRequestException('Student is not part of the group');
        }

        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const oldScore = await this.studentScoreRepo.findScoreEvent(studentId, groupId, type, normalizedDate);

        if (!oldScore) {
            throw new BadRequestException('No existing score found for the specified date and type');
        }

        const oldValue = oldScore.value;

        return this.prisma.$transaction(async (tx) => {
            await this.studentScoreRepo.updateEvent(tx, { ...dto, date: normalizedDate }, studentId, groupId, value);
            const diff = value - oldValue;
            await this.studentScoreRepo.updateTotalScore(tx, { studentId, groupId, scoreType: type, date: normalizedDate, score: diff });

        })
    }


}
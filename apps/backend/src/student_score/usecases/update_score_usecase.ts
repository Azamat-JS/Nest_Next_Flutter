import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { UpdateScoreDto } from "../dto/score.dto";

@Injectable()
export class UpdateScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }
    async execute(body: UpdateScoreDto, studentId: string, groupId: string) {
        const { homeworkScore, attendanceScore } = body;

        if (homeworkScore !== null && attendanceScore !== null) {
            throw new BadRequestException('At least one score must be provided.');
        }

        const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

        if (!studentGroup) {
            throw new BadRequestException('Student is not part of the group');
        }

        const oldScore = await this.studentScoreRepo.findScoreEvent(studentId, groupId, body.type, body.date);

        if (!oldScore) {
            throw new BadRequestException('No existing score found for the specified date and type');
        }

        const oldValue = oldScore?.value ?? 0;
        const newValue = body.homeworkScore ?? body.attendanceScore ?? 0;
        const diff = newValue - oldValue;

        return this.prisma.$transaction(async (tx) => {
            await this.studentScoreRepo.updateEvent(tx, body, studentId, groupId, newValue);
            await this.studentScoreRepo.updateTotalScore(tx, { studentId, groupId, scoreType: body.type, date: body.date, score: diff });

        })
    }


}
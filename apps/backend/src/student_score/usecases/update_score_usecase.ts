import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { UpdateScoreDto } from "../dto/score.dto";

@Injectable()
export class UpdateScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }
    async execute(body: UpdateScoreDto, studentId: string, groupId: string) {
        // const { homeworkScore, attendanceScore } = body;

        // if (homeworkScore !== null && attendanceScore !== null) {
        //     throw new BadRequestException('At least one score must be provided.');
        // }

        // if (!event) {
        //     throw new BadRequestException('Event not found');
        // }

        // const diff = score - event.value;

        // return this.prisma.$transaction(async (tx) => {
        //     await this.studentScoreRepo.updateEvent(tx, dto, eventId);

        //     await this.studentScoreRepo.updateTotalScore(tx, dto, diff);

        //     return { updated: true };
        // });
    }


}
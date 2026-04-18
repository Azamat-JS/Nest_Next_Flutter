import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { StudentScoreRepository } from "../student_score.service";
import { ScoreDto } from "../dto/score.dto";

@Injectable()
export class UpdateScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService) { }
    async execute(dto: ScoreDto, eventId: string) {
        const { score } = dto;

        if (score <= 0) {
            throw new BadRequestException('Score must be positive');
        }

        const event = await this.studentScoreRepo.getEventById(eventId);

        if (!event) {
            throw new BadRequestException('Event not found');
        }

        const diff = score - event.value;

        return this.prisma.$transaction(async (tx) => {
            await this.studentScoreRepo.updateEvent(tx, dto, eventId);

            await this.studentScoreRepo.updateTotalScore(tx, dto, diff);

            return { updated: true };
        });
    }


}
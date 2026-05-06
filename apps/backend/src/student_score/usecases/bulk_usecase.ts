import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentScoreRepository } from "../student_score.service";
import { PrismaService } from "src/prisma/prisma.service";
import { BulkScoreDto } from "../dto/bulk.dto";
import { ScoreType } from "@prisma/client/edge";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ScoreCreatedEvent } from "src/lib/events/score_create_event"

@Injectable()
export class BulkAddScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService, private eventEmitter: EventEmitter2) { }

    async execute(dto: BulkScoreDto) {
        const events: ScoreCreatedEvent[] = [];
        const { groupId, scoreType, students } = dto;

        const results = await this.prisma.$transaction(async (tx) => {
            const res: any[] = [];

            for (const student of students) {
                const { studentId, score } = student;

                if (score <= 0) {
                    throw new BadRequestException('Score must be positive')
                }

                const restrictOncePerDayTypes = ["ATTENDANCE", "HOMEWORK"] as ScoreType[];

                if (restrictOncePerDayTypes.includes(scoreType)) {
                    const alreadyMarked = await this.studentScoreRepo.findTodayScoreWithType(
                        studentId,
                        groupId,
                        scoreType
                    );

                    if (alreadyMarked) {
                        throw new BadRequestException(
                            `The student already has a ${scoreType.toLowerCase()} score for today`
                        );
                    }
                }

                const studentGroup = await this.studentScoreRepo.findStudentWithGroup(studentId, groupId);

                if (!studentGroup) {
                    throw new BadRequestException(`Student ${studentId} is not part of the group`);
                }
                const date = new Date();
                date.setHours(0, 0, 0, 0);

                const scoreDto = {
                    studentId,
                    groupId,
                    scoreType,
                    score,
                    date,
                };
                const addedScore = await this.studentScoreRepo.addScore(tx, scoreDto);
                res.push(addedScore);

                events.push(new ScoreCreatedEvent(studentId, score, scoreType, date))
            }
            return res;
        });

        for (const event of events) {
            this.eventEmitter.emit('score.created', event);
        }
        return results;
    }
}
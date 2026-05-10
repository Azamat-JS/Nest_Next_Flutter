import { BadRequestException, Injectable } from "@nestjs/common";
import { StudentScoreRepository } from "../student_score.service";
import { PrismaService } from "src/prisma/prisma.service";
import { BulkScoreDto } from "../dto/bulk.dto";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ScoreCreatedEvent } from "src/lib/events/score_create_event"

@Injectable()
export class BulkAddScoreUseCase {
    constructor(private readonly studentScoreRepo: StudentScoreRepository, private readonly prisma: PrismaService, private eventEmitter: EventEmitter2) { }

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

        const events = students.map(({ studentId, score }) => new ScoreCreatedEvent(studentId, score, scoreType, date));

        setImmediate(() => {
            for (const event of events) {
                this.eventEmitter.emit('score.created', event);
            }
        });

        return { count: data.length };
    }
}
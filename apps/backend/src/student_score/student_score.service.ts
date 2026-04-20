import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScoreDto } from './dto/score.dto';
import { Prisma } from '@prisma/client/scripts/default-index.js';
import { ScoreType } from '@prisma/client';

@Injectable()
export class StudentScoreRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findStudentWithGroup(studentId: string, groupId: string) {
        return this.prisma.studentGroup.findFirst({
            where: {
                studentId,
                groupId,
            }
        })
    }

    async getEventById(eventId: string) {
        return this.prisma.scoreEvent.findUnique({
            where: {
                id: eventId,
            }
        })
    }

    async addScore(tx: Prisma.TransactionClient, dto: ScoreDto) {
        return tx.scoreEvent.create({
            data: {
                studentId: dto.studentId,
                groupId: dto.groupId,
                type: dto.scoreType,
                value: dto.score,
            }
        })
    }

    async updateTotalScore(tx: Prisma.TransactionClient, dto: ScoreDto, diff?: number) {
        return tx.studentScore.upsert({
            where: {
                studentId_groupId: {
                    studentId: dto.studentId,
                    groupId: dto.groupId,
                }
            },
            update: {
                total: {
                    increment: diff ?? dto.score,
                }
            },
            create: {
                studentId: dto.studentId,
                groupId: dto.groupId,
                total: dto.score,
            }
        })
    }

    async updateEvent(tx: Prisma.TransactionClient, dto: ScoreDto, eventId: string) {
        return tx.scoreEvent.update({
            where: { id: eventId },
            data: { value: dto.score },
        });
    }

    async findScoreByTypeAndStudentAndGroup(studentId: string, groupId: string, scoreType: ScoreType) {
        return this.prisma.scoreEvent.findFirst({
            where: {
                studentId,
                groupId,
                type: scoreType,
            }
        })
    }

    async findTotalScoreByStudentAndGroup(studentId: string, groupId: string) {
        const totalScore = this.prisma.studentScore.findUnique({
            where: {
                studentId_groupId: {
                    studentId,
                    groupId,
                },
            },
            select: {
                total: true,
            }
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayScoreEvents = this.prisma.scoreEvent.findMany({
            where: {
                studentId,
                groupId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            },
            select: {
                type: true,
                value: true,
            }
        });

        const [total, todayEvents] = await this.prisma.$transaction([totalScore, todayScoreEvents]);

        return {
            total: total?.total || 0,
            todayEvents,
        }
    }

    async findTodayAttendance(studentId: string, groupId: string, type: ScoreType) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);


        return this.prisma.scoreEvent.findFirst({
            where: {
                studentId,
                groupId,
                type,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        })
    }

    async getAllStudentsScoreByGroup(groupId: string) {
        return this.prisma.scoreEvent.findMany({
            where: {
                groupId,
            },
            include: {
                student: true,
            }
        })
    }
}

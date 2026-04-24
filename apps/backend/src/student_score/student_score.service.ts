import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScoreDto, UpdateScoreDto } from './dto/score.dto';
import { Prisma } from '@prisma/client/scripts/default-index.js';
import { ScoreType } from '@prisma/client';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';

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

    async findOneStudentScores(
        studentId: string,
        groupId: string,
        query: PaginationDto
    ) {
        const { limit = 10, page = 1 } = query;
        const skip = (page - 1) * limit;

        return this.prisma.$transaction(async (tx) => {
            const grouped = await tx.scoreEvent.groupBy({
                by: ['date', 'type'],
                where: { studentId, groupId },
                _sum: { value: true },
                orderBy: {
                    date: 'desc', // ✅ IMPORTANT
                },
            });

            const map = new Map<
                string,
                { date: string; homework: number; attendance: number }
            >();

            for (const g of grouped) {
                const date = g.date.toISOString().split('T')[0];
                if (!map.has(date)) {
                    map.set(date, { date, homework: 0, attendance: 0 });
                }

                const entry = map.get(date)!;

                if (g.type === 'HOMEWORK') {
                    entry.homework = g._sum.value ?? 0;
                }

                if (g.type === 'ATTENDANCE') {
                    entry.attendance = g._sum.value ?? 0;
                }
            }

            const allDays = Array.from(map.values());

            const totalCount = allDays.length;
            const paginated = allDays.slice(skip, skip + limit);

            const total = await tx.studentScore.findUnique({
                where: {
                    studentId_groupId: {
                        studentId,
                        groupId,
                    },
                },
                select: {
                    total: true,
                },
            });

            return {
                scores: paginated,
                total,
                page,
                limit,
                total_count: totalCount,
                last_page: Math.ceil(totalCount / limit),
            };
        });
    }

    async addScore(tx: Prisma.TransactionClient, dto: ScoreDto) {
        await tx.scoreEvent.create({
            data: {
                studentId: dto.studentId,
                groupId: dto.groupId,
                type: dto.scoreType,
                value: dto.score,
                date: new Date(dto.date!).toISOString(),
            },
        });

        await tx.studentScore.upsert({
            where: {
                studentId_groupId: {
                    studentId: dto.studentId,
                    groupId: dto.groupId,
                },
            },
            update: {
                total: { increment: dto.score },
                homework: dto.scoreType === "HOMEWORK" ? { increment: dto.score } : undefined,
                attendance: dto.scoreType === "ATTENDANCE" ? { increment: dto.score } : undefined,
            },
            create: {
                studentId: dto.studentId,
                groupId: dto.groupId,
                total: dto.score,
                homework: dto.scoreType === "HOMEWORK" ? dto.score : 0,
                attendance: dto.scoreType === "ATTENDANCE" ? dto.score : 0,
            },
        });
    }

    async updateTotalScore(tx: Prisma.TransactionClient, dto: ScoreDto) {

        return tx.studentScore.upsert({
            where: {
                studentId_groupId: {
                    studentId: dto.studentId,
                    groupId: dto.groupId,
                }
            },
            update: {
                total: { increment: dto.score },
                homework: dto.scoreType === "HOMEWORK" ? { increment: dto.score } : undefined,
                attendance: dto.scoreType === "ATTENDANCE" ? { increment: dto.score } : undefined,
            },
            create: {
                studentId: dto.studentId,
                groupId: dto.groupId,
                total: dto.score,
                homework: dto.scoreType === "HOMEWORK" ? dto.score : 0,
                attendance: dto.scoreType === "ATTENDANCE" ? dto.score : 0,
            }
        })
    }

    async updateEvent(tx: Prisma.TransactionClient, dto: UpdateScoreDto, studentId: string, groupId: string, value: number) {
        return tx.scoreEvent.update({
            where: {
                studentId_groupId_type_date: {
                    studentId,
                    groupId,
                    date: dto.date,
                    type: dto.type,
                }
            },
            data: {
                value,
            }
        });
    }

    async findScoreEvent(studentId: string, groupId: string, scoreType: ScoreType, date: Date) {
        return this.prisma.scoreEvent.findFirst({
            where: {

                studentId,
                groupId,
                type: scoreType,
                date,

            },
            select: { value: true },
        })
    }

    // async findAllScoresByGroup(groupId: string) {
    //     return this.prisma.scoreEvent.findMany({
    //         where: {
    //             groupId,
    //         },
    //         select: {
    //             studentId: true,
    //             type: true,
    //             value: true,
    //             createdAt: true,
    //             student: {
    //                 select: {
    //                     username: true,
    //                 },
    //             },
    //         },
    //         orderBy: {
    //             createdAt: 'desc',
    //         },
    //     });
    // }

    async getTodayStudentsScoreByGroup(groupId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const group = await this.prisma.groups.findUnique({
            where: { id: groupId },
            select: {
                students: {
                    select: {
                        student: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!group) {
            throw new Error(`Group not found: ${groupId}`);
        }

        const students = group.students?.map(s => s.student) ?? [];

        const grouped = await this.prisma.scoreEvent.groupBy({
            by: ['studentId', 'type'],
            where: {
                groupId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            _sum: {
                value: true,
            },
        });

        const resultMap = new Map<string, any>();

        for (const s of students) {
            resultMap.set(s.id, {
                studentId: s.id,
                username: s.username,
                homework: 0,
                attendance: 0,
                total: 0,
            });
        }

        for (const g of grouped) {
            const entry = resultMap.get(g.studentId);
            if (!entry) continue;

            const value = g._sum.value ?? 0;

            if (g.type === 'HOMEWORK') entry.homework = value;
            if (g.type === 'ATTENDANCE') entry.attendance = value;

            entry.total += value;
        }

        return Array.from(resultMap.values());
    }

    async findTodayScoreWithType(
        studentId: string,
        groupId: string,
        scoreType: ScoreType
    ) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return this.prisma.scoreEvent.findFirst({
            where: {
                studentId,
                groupId,
                type: scoreType,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: { id: true },
        });
    }

    async getAllStudentsScoreByGroup(groupId: string) {
        const grouped = await this.prisma.scoreEvent.groupBy({
            by: ['studentId', 'type'],
            where: { groupId },
            _sum: {
                value: true,
            },
        });

        const students = await this.prisma.users.findMany({
            where: {
                scoreEvents: {
                    some: { groupId },
                },
            },
            select: {
                id: true,
                username: true,
            },
        });

        // 3. Create student map (O(1) lookup)
        const studentMap = new Map(
            students.map((s) => [s.id, s.username])
        );

        // 4. Transform grouped data into final shape
        const resultMap = new Map<
            string,
            {
                studentId: string;
                username: string;
                homework: number;
                attendance: number;
                total: number;
            }
        >();

        for (const g of grouped) {
            const { studentId, type, _sum } = g;
            const value = _sum.value ?? 0;

            if (!resultMap.has(studentId)) {
                resultMap.set(studentId, {
                    studentId,
                    username: studentMap.get(studentId) || '',
                    homework: 0,
                    attendance: 0,
                    total: 0,
                });
            }

            const entry = resultMap.get(studentId)!;

            if (type === 'HOMEWORK') entry.homework = value;
            if (type === 'ATTENDANCE') entry.attendance = value;

            entry.total += value;
        }
        return Array.from(resultMap.values());
    }

    async deleteMany() {
        return this.prisma.$transaction(async (tx) => {
            await tx.scoreEvent.deleteMany();
            await tx.studentScore.deleteMany();
        })
    }
}

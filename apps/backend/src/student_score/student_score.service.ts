import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScoreDto, UpdateScoreDto } from './dto/score.dto';
import { Prisma } from '@prisma/client/scripts/default-index.js';
import { ScoreType } from '@prisma/client';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { ChartDateDto } from 'src/lib/shared/dto/chart_date.dto';

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

    async findStudentsInGroup(groupId: string, studentIds: string[]) {
        return this.prisma.studentGroup.findMany({
            where: {
                groupId,
                studentId: {
                    in: studentIds
                }
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
            const scores = await tx.scoreEvent.findMany({
                where: {
                    studentId,
                    groupId,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    date: true,
                    type: true,
                    value: true,
                    comment: true,
                    student: {
                        select: {
                            username: true,
                        },
                    },
                },
            })

            const map = new Map<
                string,
                { date: string; homework: number; attendance: number, comment: string | null }
            >();

            for (const s of scores) {
                const date = s.date.toISOString().split('T')[0];
                if (!map.has(date)) {
                    map.set(date, { date, homework: 0, attendance: 0, comment: null });
                }

                const entry = map.get(date)!;

                if (s.type === 'HOMEWORK') {
                    entry.homework += s.value;
                }

                if (s.type === 'ATTENDANCE') {
                    entry.attendance += s.value;
                }
                if (s.comment) {
                    entry.comment = entry.comment ? `${entry.comment} | ${s.comment}` : s.comment;
                }
            }


            const grouped = Array.from(map.values());
            const totalCount = grouped.length;

            const paginated = grouped.slice(skip, skip + limit);

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
                comment: dto.comment,
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

        return tx.studentScore.update({
            where: {
                studentId_groupId: {
                    studentId: dto.studentId,
                    groupId: dto.groupId,
                }
            },
            data: {
                total: { increment: dto.score },
                ...(dto.scoreType === "HOMEWORK" && {
                    homework: { increment: dto.score }
                }),
                ...(dto.scoreType === "ATTENDANCE" && {
                    attendance: { increment: dto.score }
                })
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
                ...dto,
                value,
            }
        });
    }

    async findScoreEvent(studentId: string, groupId: string, scoreType: ScoreType, date: Date) {
        return this.prisma.scoreEvent.findUnique({
            where: {
                studentId_groupId_type_date: {
                    studentId,
                    groupId,
                    type: scoreType,
                    date,
                }
            },
            select: { value: true, comment: true }
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
        const resultsArray = Array.from(resultMap.values());

        for (const g of grouped) {
            const entry = resultMap.get(g.studentId);
            if (!entry) continue;

            const value = g._sum.value ?? 0;

            if (g.type === 'HOMEWORK') entry.homework = value;
            if (g.type === 'ATTENDANCE') entry.attendance = value;

            entry.total += value;
        }
        const numberOfStudents = resultsArray.length;

        if (numberOfStudents === 0) {
            return {
                students: [],
                avgHomework: 0,
                avgAttendance: 0,
                avg: 0
            }
        }

        let totalHomework: number = 0;
        let totalAttendance: number = 0;

        for (const student of resultsArray) {
            totalAttendance += student.attendance;
            totalHomework += student.homework;
        }

        const avgHomework = totalHomework / numberOfStudents;
        const avgAttendance = totalAttendance / numberOfStudents;

        const avg = (avgHomework + avgAttendance) / 2;
        return {
            students: resultsArray,
            avgHomework,
            avgAttendance,
            avg
        }
    }

    async getGroupTotalAvgScores(groupId: string, year: number) {

        const group = await this.prisma.groups.findUnique({
            where: { id: groupId },
        })
        if (!group) throw new NotFoundException(`Group not found: ${groupId}`)

        const grouped = await this.prisma.scoreEvent.findMany({
            where: {
                groupId,
                date: {
                    gte: new Date(year, 0, 1),
                    lte: new Date(year, 11, 31, 23, 59, 59),
                },
            },
            select: {
                date: true,
                type: true,
                value: true,
                studentId: true
            },
            orderBy: {
                date: 'asc'
            }
        })

        const monthMap = new Map<string, {
            month: string;
            homeworkTotal: number;
            attendanceTotal: number;
            homeworkCount: number;
            attendanceCount: number;
        }
        >();


        for (const item of grouped) {
            const month = new Date(item.date).toLocaleString('default', { month: 'short' })

            if (!monthMap.has(month)) {
                monthMap.set(month, {
                    month, homeworkTotal: 0,
                    attendanceTotal: 0,
                    homeworkCount: 0,
                    attendanceCount: 0,
                });
            }
            const entry = monthMap.get(month)!;

            if (item.type === 'HOMEWORK') {
                entry.homeworkTotal += item.value;
                entry.homeworkCount++;
            }

            if (item.type === 'ATTENDANCE') {
                entry.attendanceTotal += item.value;
                entry.attendanceCount++;
            }

        }
        const scores = Array.from(monthMap.values()).map((m) => {
            const homework = m.homeworkCount > 0 ? Number((m.homeworkTotal / m.homeworkCount).toFixed(2)) : 0;

            const attendance = m.attendanceCount > 0 ? Number((m.attendanceTotal / m.attendanceCount).toFixed(2)) : 0;

            return {
                month: m.month,
                homework,
                attendance,
                total: Number((homework + attendance).toFixed(2))
            }
        })
        return {
            scores
        }
    }

    async findTodayScoreWithType(
        studentIds: string[],
        groupId: string,
        scoreType: ScoreType
    ) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        return this.prisma.scoreEvent.findMany({
            where: {
                studentId: {
                    in: studentIds
                },
                groupId,
                type: scoreType,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            select: { studentId: true },
        });
    }

    async leaderboard(dto: PaginationDto) {
        const { limit = 10, page = 1 } = dto;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studentScore.findMany({
                take: dto.limit,
                skip,
                orderBy: {
                    total: 'desc',
                },
                select: {
                    total: true,
                    homework: true,
                    attendance: true,
                    student: {
                        select: {
                            username: true,
                        }
                    },
                    group: {
                        select: {
                            name: true,
                        }
                    }
                }
            }),
            this.prisma.studentScore.count(),
        ])

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit
            }
        }
    }

    async groupLeadeboard(groupId: string, dto: PaginationDto) {
        const { limit = 10, page = 1 } = dto;
        const skip = (page - 1) * limit;
        const group = await this.prisma.groups.findUnique({
            where: { id: groupId },
        });

        if (!group) throw new NotFoundException(`Group not found: ${groupId}`)

        const [data, total] = await Promise.all([this.prisma.studentScore.findMany({
            take: dto.limit,
            skip,
            where: {
                groupId,
            },
            orderBy: {
                total: 'desc',
            },
            select: {
                total: true,
                homework: true,
                attendance: true,
                student: {
                    select: {
                        username: true,
                    }
                },
            }
        }),
        this.prisma.studentScore.count({
            where: {
                groupId,
            },
        })
        ])
        return {
            data,
            meta: {
                total: total,
                page,
                last_page: Math.ceil(total / limit),
                limit
            }
        }
    }

    async getAllStudentsScoreByGroup(groupId: string) {
        const grouped = await this.prisma.scoreEvent.groupBy({
            by: ['studentId', 'type'],
            where: { groupId },
            _sum: {
                value: true,
            },
        });

        const studentIds = [...new Set(grouped.map(g => g.studentId))]

        const students = await this.prisma.users.findMany({
            where: {
                id: {
                    in: studentIds
                }
            }
        })

        const studentMap = new Map(
            students.map((s) => [s.id, s.username])
        );

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
        };

        const studentsArray = Array.from(resultMap.values());
        const numberOfStudents = studentsArray.length;

        if (numberOfStudents === 0) {
            return {
                students: [],
                avgHomework: 0,
                avgAttendance: 0,
                avg: 0
            }
        };

        let totalHomework: number = 0;
        let totalAttendance: number = 0;

        for (const student of studentsArray) {
            totalAttendance += student.attendance;
            totalHomework += student.homework;
        }

        const avgHomework = totalHomework / numberOfStudents;
        const avgAttendance = totalAttendance / numberOfStudents;

        const avg = (avgHomework + avgAttendance) / 2;
        return {
            students: studentsArray,
            avgHomework,
            avgAttendance,
            avg
        }
    }

    async getScoreHistoryForChart(studentId: string, groupId: string, query: ChartDateDto) {
        const { year, month } = query;

        const student = await this.prisma.users.findUnique({
            where: { id: studentId },
        });

        if (!student) throw new NotFoundException(`Student not found: ${studentId}`);

        const group = await this.prisma.groups.findUnique({
            where: { id: groupId },
        });

        if (!group) throw new NotFoundException(`Group not found: ${groupId}`);

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);

        const grouped = await this.prisma.scoreEvent.groupBy({
            by: ['date', 'type'],
            where: {
                studentId,
                groupId,
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                value: true,
            },
            orderBy: {
                date: 'asc'
            }
        });

        const map = new Map<
            string, {
                date: string,
                homework: number,
                attendance: number
            }
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
        return {
            scores: Array.from(map.values())
        }
    }

    async deleteMany() {
        return this.prisma.$transaction(async (tx) => {
            await tx.scoreEvent.deleteMany();
            await tx.studentScore.deleteMany();
        })
    }
}

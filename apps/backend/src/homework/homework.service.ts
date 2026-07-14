import { Inject, Injectable } from "@nestjs/common";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { Prisma } from "@prisma/client";
import { HomeworkQueryDto } from "./dto/homework.dto";

@Injectable()
export class HomeworkRepository {
    constructor(@Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient) { }

    async create(data: Prisma.HomeworkCreateInput) {
        return this.prisma.homework.create({ data });
    }

    async findGroupScheduleDays(groupId: string): Promise<number[]> {
        const schedules = await this.prisma.groupLessonSchedule.findMany({
            where: { groupId },
            select: { dayOfWeek: true },
        });
        return schedules.map(s => s.dayOfWeek);
    }

    async findByGroup(groupId: string, query: HomeworkQueryDto) {
        const { limit = 10, page = 1, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.HomeworkWhereInput = {
            groupId,
            ...(search && { topic: { contains: search, mode: 'insensitive' } }),
        };

        const [data, total] = await Promise.all([
            this.prisma.homework.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.homework.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            },
        };
    }
}

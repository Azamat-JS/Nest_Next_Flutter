import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';
import { CreateWaitingListDto, GetWaitingListQueryDto, UpdateWaitingListDto } from './dto/waiting-list.dto';

@Injectable()
export class WaitingListService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async getAll(query: GetWaitingListQueryDto) {
        const { limit = 10, page = 1, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.WaitingListWhereInput = {
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.waitingList.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.waitingList.count({ where }),
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

    async create(dto: CreateWaitingListDto) {
        return this.prisma.waitingList.create({
            data: { ...dto, tenantId: this.tenantContext.getTenantId()! },
        });
    }

    async update(id: string, dto: UpdateWaitingListDto) {
        const found = await this.prisma.waitingList.findUnique({ where: { id } });
        if (!found) {
            throw new NotFoundException('Waiting list entry not found');
        }
        return this.prisma.waitingList.update({ where: { id }, data: dto });
    }

    async delete(id: string) {
        const found = await this.prisma.waitingList.findUnique({ where: { id } });
        if (!found) {
            throw new NotFoundException('Waiting list entry not found');
        }
        await this.prisma.waitingList.delete({ where: { id } });
        return { message: 'Waiting list entry deleted successfully' };
    }
}

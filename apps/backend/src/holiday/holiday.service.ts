import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@Injectable()
export class HolidayService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async findAll() {
        return this.prisma.holiday.findMany({
            orderBy: { date: 'asc' },
            select: {
                id: true,
                date: true,
                reason: true,
                createdAt: true,
            },
        });
    }

    async create(dto: CreateHolidayDto) {
        const date = this.toDate(dto.date);
        await this.assertDateFree(date);
        const tenantId = this.tenantContext.getTenantId()!;
        return this.prisma.holiday.create({
            data: {
                date,
                reason: dto.reason.trim(),
                tenantId,
            },
        });
    }

    async update(id: string, dto: UpdateHolidayDto) {
        const holiday = await this.prisma.holiday.findFirst({ where: { id } });
        if (!holiday) throw new NotFoundException('Holiday not found');
        const date = this.toDate(dto.date);
        if (holiday.date.getTime() !== date.getTime()) {
            await this.assertDateFree(date);
        }
        return this.prisma.holiday.update({
            where: { id },
            data: {
                date,
                reason: dto.reason.trim(),
            },
        });
    }

    async remove(id: string) {
        const holiday = await this.prisma.holiday.findFirst({ where: { id } });
        if (!holiday) throw new NotFoundException('Holiday not found');
        await this.prisma.holiday.delete({ where: { id } });
        return { message: 'Holiday deleted successfully!' };
    }

    // Normalize to a date-only value so the @db.Date column and uniqueness
    // checks are unaffected by the caller's time-of-day or timezone.
    private toDate(value: string) {
        return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
    }

    private async assertDateFree(date: Date) {
        const existing = await this.prisma.holiday.findFirst({ where: { date } });
        if (existing) throw new ConflictException('A holiday on this date already exists');
    }
}

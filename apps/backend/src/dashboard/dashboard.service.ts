import { Inject, Injectable } from '@nestjs/common';
import { PaymentMethod, UserRole } from '@prisma/client';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { DashboardStatsQueryDto, PaymentsChartQueryDto } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
    ) { }

    async getStats(query: DashboardStatsQueryDto) {
        const now = new Date();
        const month = query.month ?? now.getMonth() + 1;
        const year = query.year ?? now.getFullYear();

        const [
            leads,
            groups,
            teachers,
            students,
            groupMemberships,
            rooms,
            memberships,
            monthPayments,
        ] = await Promise.all([
            this.prisma.waitingList.count(),
            this.prisma.groups.count(),
            this.prisma.users.count({ where: { role: UserRole.TEACHER } }),
            this.prisma.users.count({ where: { role: UserRole.STUDENT } }),
            this.prisma.studentGroup.count(),
            this.prisma.room.count(),
            this.prisma.studentGroup.findMany({
                select: { studentId: true, groupId: true },
            }),
            this.prisma.studentPayment.findMany({
                where: { month, year },
                select: { studentId: true, groupId: true, amount: true },
            }),
        ]);

        // A membership counts as a debt until a payment for this month exists
        // for the same (student, group) pair.
        const paidPairs = new Set(monthPayments.map(p => `${p.studentId}:${p.groupId}`));
        const debtors = memberships.filter(m => !paidPairs.has(`${m.studentId}:${m.groupId}`)).length;

        const monthIncome = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const paidCount = monthPayments.length;

        return {
            month,
            year,
            leads,
            groups,
            teachers,
            students,
            groupMemberships,
            rooms,
            debtors,
            paidCount,
            monthIncome,
            averagePayment: paidCount > 0 ? Math.round(monthIncome / paidCount) : 0,
        };
    }

    async getPaymentsChart(query: PaymentsChartQueryDto) {
        const year = query.year ?? new Date().getFullYear();

        const [byMonth, byMethod] = await Promise.all([
            this.prisma.studentPayment.groupBy({
                by: ['month'],
                where: { year },
                _sum: { amount: true },
                _count: { _all: true },
            }),
            this.prisma.studentPayment.groupBy({
                by: ['paymentMethod'],
                where: { year },
                _sum: { amount: true },
                _count: { _all: true },
            }),
        ]);

        const monthTotals = new Map(byMonth.map(row => [row.month, Number(row._sum.amount ?? 0)]));

        return {
            year,
            monthly: Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                total: monthTotals.get(i + 1) ?? 0,
            })),
            methods: Object.values(PaymentMethod).map(method => {
                const row = byMethod.find(r => r.paymentMethod === method);
                return {
                    method,
                    total: Number(row?._sum.amount ?? 0),
                    count: row?._count._all ?? 0,
                };
            }),
        };
    }

    async getSchedule() {
        const [rooms, lessons] = await Promise.all([
            this.prisma.room.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true },
            }),
            this.prisma.groupLessonSchedule.findMany({
                select: {
                    id: true,
                    dayOfWeek: true,
                    time: true,
                    durationMinutes: true,
                    roomId: true,
                    group: {
                        select: {
                            id: true,
                            name: true,
                            teacher: { select: { firstName: true, lastName: true } },
                        },
                    },
                },
                orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
            }),
        ]);

        return { rooms, lessons };
    }
}

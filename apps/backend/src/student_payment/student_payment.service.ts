import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { LatestPaymentsQueryDto, StudentPaymentDto, UpdatePaymentDto } from './dto/student_payment.dto';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';

@Injectable()
export class StudentPaymentService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async createPayment(dto: StudentPaymentDto, studentId: string, groupId: string) {
        const student = await this.prisma.users.findUnique({ where: { id: studentId } })
        if (!student) {
            throw new NotFoundException("Student not found")
        }
        const group = await this.prisma.groups.findUnique({ where: { id: groupId } })
        if (!group) {
            throw new NotFoundException("Group not found")
        }
        return await this.prisma.studentPayment.create({
            data: {
                ...dto,
                groupId: group.id,
                studentId: student.id,
                tenantId: this.tenantContext.getTenantId()!,
            },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                group: { select: { id: true, name: true } },
            }
        })
    }

    async getAllPayments(query: PaginationDto) {
        const { limit = 10, page = 1 } = query;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studentPayment.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                    group: { select: { id: true, name: true } },
                }
            }),
            this.prisma.studentPayment.count()
        ]);
        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            },
        }
    }

    async getLatestPaymentsPerStudent(query: LatestPaymentsQueryDto) {
        const { limit = 10, page = 1, search, groupId } = query;
        const skip = (page - 1) * limit;

        const whereClause: any = {};
        if (groupId) whereClause.groupId = groupId;
        if (search) {
            whereClause.student = {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ]
            };
        }

        const [allDistinct, distinctPage] = await Promise.all([
            this.prisma.studentPayment.findMany({
                where: whereClause,
                select: { studentId: true },
                distinct: ['studentId'],
            }),
            this.prisma.studentPayment.findMany({
                where: whereClause,
                select: { studentId: true },
                distinct: ['studentId'],
                skip,
                take: limit,
            }),
        ]);

        const total = allDistinct.length;

        const payments = await Promise.all(
            distinctPage.map(({ studentId }) =>
                this.prisma.studentPayment.findFirst({
                    where: { studentId, ...(groupId ? { groupId } : {}) },
                    orderBy: [{ year: 'desc' }, { month: 'desc' }],
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                        group: { select: { id: true, name: true } },
                    }
                })
            )
        );

        return {
            data: payments.filter(Boolean),
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            }
        };
    }

    async getPaymentById(paymentId: string) {
        const payment = await this.prisma.studentPayment.findUnique({
            where: { id: paymentId },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                group: { select: { id: true, name: true } },
            }
        });
        if (!payment) {
            throw new NotFoundException("Payment not found")
        }
        return payment;
    }

    async updatePayment(dto: UpdatePaymentDto, paymentId: string) {
        const existing = await this.prisma.studentPayment.findUnique({ where: { id: paymentId } });
        if (!existing) {
            throw new NotFoundException("Payment not found");
        }
        return await this.prisma.studentPayment.update({
            where: { id: paymentId },
            data: dto,
            include: {
                student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                group: { select: { id: true, name: true } },
            }
        });
    }

    async getStudentPayments(studentId: string, query: PaginationDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studentPayment.findMany({
                skip,
                take: limit,
                where: { studentId },
                orderBy: [{ year: 'desc' }, { month: 'desc' }],
                include: {
                    group: { select: { id: true, name: true } },
                }
            }),
            this.prisma.studentPayment.count({ where: { studentId } })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            }
        }
    }

    async getGroupPayments(groupId: string, query: PaginationDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studentPayment.findMany({
                skip,
                take: limit,
                where: { groupId },
                include: {
                    student: { select: { id: true, firstName: true, lastName: true, phone: true } },
                    group: { select: { id: true, name: true } },
                }
            }),
            this.prisma.studentPayment.count({ where: { groupId } })
        ]);
        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            }
        }
    }

    async deletePaymentById(paymentId: string) {
        const payment = await this.prisma.studentPayment.delete({ where: { id: paymentId } });
        if (!payment) {
            throw new NotFoundException("Payment not found")
        }
        return { message: "Payment deleted successfully!" }
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentPaymentDto, UpdatePaymentDto } from './dto/student_payment.dto';
import { Prisma } from '@prisma/client';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';

@Injectable()
export class StudentPaymentService {
    constructor(private readonly prisma: PrismaService) { }

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
                studentId: student.id
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
                orderBy: {
                    createdAt: "desc"
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

    async getPaymentById(paymentId: string) {
        const payment = await this.prisma.studentPayment.findUnique({ where: { id: paymentId } });

        if (!payment) {
            throw new NotFoundException("Payment not found")
        }
        return payment;
    }

    async updatePayment(dto: UpdatePaymentDto, paymentId: string) {
        const existing = await this.prisma.studentPayment.findUnique({
            where: { id: paymentId }
        });

        if (!existing) {
            throw new NotFoundException("Payment not found");
        }

        return await this.prisma.studentPayment.update({
            where: { id: paymentId },
            data: dto
        });
    }

    async getStudentPayments(studentId: string, query: PaginationDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.studentPayment.findMany({
                skip,
                take: limit,
                where: {
                    studentId
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
                where: {
                    groupId
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

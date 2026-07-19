import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';

@Injectable()
export class CourseService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async findAll() {
        return this.prisma.course.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                price: true,
                durationMonths: true,
                description: true,
                createdAt: true,
            },
        });
    }

    async create(dto: CreateCourseDto) {
        await this.assertNameFree(dto.name);
        const tenantId = this.tenantContext.getTenantId()!;
        return this.prisma.course.create({
            data: {
                name: dto.name,
                price: dto.price,
                durationMonths: dto.durationMonths,
                description: dto.description?.trim() || null,
                tenantId,
            },
        });
    }

    async update(id: string, dto: UpdateCourseDto) {
        const course = await this.prisma.course.findFirst({ where: { id } });
        if (!course) throw new NotFoundException('Course not found');
        if (course.name !== dto.name) {
            await this.assertNameFree(dto.name);
        }
        return this.prisma.course.update({
            where: { id },
            data: {
                name: dto.name,
                price: dto.price,
                durationMonths: dto.durationMonths,
                description: dto.description?.trim() || null,
            },
        });
    }

    async remove(id: string) {
        const course = await this.prisma.course.findFirst({ where: { id } });
        if (!course) throw new NotFoundException('Course not found');
        await this.prisma.course.delete({ where: { id } });
        return { message: 'Course deleted successfully!' };
    }

    private async assertNameFree(name: string) {
        const existing = await this.prisma.course.findFirst({ where: { name } });
        if (existing) throw new ConflictException('A course with this name already exists');
    }
}

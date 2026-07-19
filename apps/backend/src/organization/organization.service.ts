import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';
import { CreateBranchDto, UpdateBranchDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    // Tenant is not covered by the tenant-scoping extension, so it is always
    // addressed explicitly by the caller's tenant id.
    async getSettings() {
        const tenantId = this.tenantContext.getTenantId()!;
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                name: true,
                logoUrl: true,
                workStartTime: true,
                workEndTime: true,
            },
        });
        if (!tenant) throw new NotFoundException('Organization not found');
        return tenant;
    }

    async updateSettings(dto: UpdateOrganizationDto) {
        const tenantId = this.tenantContext.getTenantId()!;
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(dto.name !== undefined && { name: dto.name.trim() }),
                ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
                ...(dto.workStartTime !== undefined && { workStartTime: dto.workStartTime }),
                ...(dto.workEndTime !== undefined && { workEndTime: dto.workEndTime }),
            },
            select: {
                name: true,
                logoUrl: true,
                workStartTime: true,
                workEndTime: true,
            },
        });
    }

    async findAllBranches() {
        return this.prisma.branch.findMany({
            orderBy: { createdAt: 'asc' },
            select: { id: true, name: true, createdAt: true },
        });
    }

    async createBranch(dto: CreateBranchDto) {
        const name = dto.name.trim();
        await this.assertBranchNameFree(name);
        const tenantId = this.tenantContext.getTenantId()!;
        return this.prisma.branch.create({
            data: { name, tenantId },
        });
    }

    async updateBranch(id: string, dto: UpdateBranchDto) {
        const branch = await this.prisma.branch.findFirst({ where: { id } });
        if (!branch) throw new NotFoundException('Branch not found');
        const name = dto.name.trim();
        if (branch.name !== name) {
            await this.assertBranchNameFree(name);
        }
        return this.prisma.branch.update({
            where: { id },
            data: { name },
        });
    }

    async removeBranch(id: string) {
        const branch = await this.prisma.branch.findFirst({ where: { id } });
        if (!branch) throw new NotFoundException('Branch not found');
        await this.prisma.branch.delete({ where: { id } });
        return { message: 'Branch deleted successfully!' };
    }

    private async assertBranchNameFree(name: string) {
        const existing = await this.prisma.branch.findFirst({ where: { name } });
        if (existing) throw new ConflictException('A branch with this name already exists');
    }
}

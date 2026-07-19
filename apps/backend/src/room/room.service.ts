import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { TenantContextService } from 'src/lib/tenant/tenant-context.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomService {
    constructor(
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async findAll() {
        return this.prisma.room.findMany({
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                createdAt: true,
                _count: { select: { lessonSchedules: true } },
            },
        });
    }

    async create(dto: CreateRoomDto) {
        await this.assertNameFree(dto.name);
        const tenantId = this.tenantContext.getTenantId()!;
        return this.prisma.room.create({ data: { name: dto.name, tenantId } });
    }

    async update(id: string, dto: UpdateRoomDto) {
        const room = await this.prisma.room.findFirst({ where: { id } });
        if (!room) throw new NotFoundException('Room not found');
        if (room.name !== dto.name) {
            await this.assertNameFree(dto.name);
        }
        return this.prisma.room.update({ where: { id }, data: { name: dto.name } });
    }

    async remove(id: string) {
        const room = await this.prisma.room.findFirst({ where: { id } });
        if (!room) throw new NotFoundException('Room not found');
        await this.prisma.room.delete({ where: { id } });
        return { message: 'Room deleted successfully!' };
    }

    private async assertNameFree(name: string) {
        const existing = await this.prisma.room.findFirst({ where: { name } });
        if (existing) throw new ConflictException('A room with this name already exists');
    }
}

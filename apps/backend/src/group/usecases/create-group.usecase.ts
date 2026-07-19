import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateGroupDto } from "../dto/group.dto";
import { GroupRepository } from "../group.service";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { TenantContextService } from "src/lib/tenant/tenant-context.service";

@Injectable()
export class CreateGroupUseCase {
    constructor(
        private readonly groupRepo: GroupRepository,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly tenantContext: TenantContextService,
    ) { }

    async execute(dto: CreateGroupDto) {
        const teacher = await this.groupRepo.findTeacherById(dto.teacherId);

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        const studentIds = dto.studentIds?.filter(Boolean) ?? [];

        const roomIds = [...new Set(dto.lessonSchedules?.map(s => s.roomId).filter((id): id is string => !!id) ?? [])];
        await this.groupRepo.assertRoomsExist(roomIds);

        const tenantId = this.tenantContext.getTenantId()!;

        return await this.prisma.$transaction(async (tx) => {
            const group = await this.groupRepo.createGroup(tx, {
                name: dto.name,
                teacher: {
                    connect: { id: dto.teacherId }
                },
                tenant: {
                    connect: { id: tenantId }
                },
            });

            if (studentIds.length > 0) {
                await this.groupRepo.createStudentGroup(tx,
                    studentIds.map((studentId) => ({
                        studentId,
                        groupId: group.id,
                        tenantId,
                    }))
                )
            }

            if (dto.lessonSchedules && dto.lessonSchedules.length > 0) {
                await this.groupRepo.createLessonSchedules(tx,
                    dto.lessonSchedules.map(({ dayOfWeek, time, durationMinutes, roomId }) => ({
                        dayOfWeek,
                        time,
                        durationMinutes,
                        roomId,
                        groupId: group.id,
                        tenantId,
                    }))
                )
            }
            return group;
        })
    }
}
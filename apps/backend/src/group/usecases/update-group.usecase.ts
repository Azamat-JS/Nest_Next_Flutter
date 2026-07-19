import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { GroupRepository } from "../group.service";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { UpdateGroupDto } from "../dto/group.dto";

@Injectable()
export class UpdateGroupUseCase {
    constructor(private readonly groupRepo: GroupRepository, @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
    ) { }

    async execute(id: string, dto: UpdateGroupDto) {

        const group = await this.groupRepo.findOne(id);

        if (dto.teacherId) {
            const teacher = await this.groupRepo.findTeacherById(dto.teacherId);

            if (!teacher) {
                throw new NotFoundException('Teacher not found');
            }
        }

        const roomIds = [...new Set(dto.lessonSchedules?.map(s => s.roomId).filter((id): id is string => !!id) ?? [])];
        await this.groupRepo.assertRoomsExist(roomIds);

        return await this.prisma.$transaction(async (tx) => {
            await this.groupRepo.update(tx, id, {
                ...(dto.name && {
                    name: dto.name,
                }),

                ...(dto.teacherId && {
                    teacher: {
                        connect: {
                            id: dto.teacherId,
                        },
                    },
                }),

            });

            if (dto.lessonSchedules) {
                await this.groupRepo.replaceLessonSchedules(tx, id, dto.lessonSchedules);
            }

            // if (dto.studentIds) {
            //     await tx.studentGroup.deleteMany({
            //         where: {
            //             groupId: id
            //         }
            //     })
            //     if (studentIds.length > 0) {
            //         await this.groupRepo.createStudents(
            //             tx,
            //             studentIds,
            //             group.id
            //         )
            //     }
            // }
            return this.groupRepo.findOne(id);
        })
    }
}
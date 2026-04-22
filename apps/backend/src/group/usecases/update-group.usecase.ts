import { Injectable, NotFoundException } from "@nestjs/common";
import { GroupRepository } from "../group.service";
import { PrismaService } from "src/prisma/prisma.service";
import { UpdateGroupDto } from "../dto/group.dto";

@Injectable()
export class UpdateGroupUseCase {
    constructor(private readonly groupRepo: GroupRepository, private readonly prisma: PrismaService,
    ) { }

    async execute(id: string, dto: UpdateGroupDto) {

        const group = await this.groupRepo.findOne(id);

        if (dto.teacherId) {
            const teacher = await this.groupRepo.findTeacherById(dto.teacherId);

            if (!teacher) {
                throw new NotFoundException('Teacher not found');
            }
        }

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
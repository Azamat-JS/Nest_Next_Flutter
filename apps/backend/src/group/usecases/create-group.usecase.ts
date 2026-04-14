import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateGroupDto } from "../dto/group.dto";
import { GroupRepository } from "../group.service";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class CreateGroupUseCase {
    constructor(private readonly groupRepo: GroupRepository, private readonly prisma: PrismaService,
    ) { }

    async execute(dto: CreateGroupDto) {
        const teacher = await this.groupRepo.findTeacherById(dto.teacherId);

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        const studentIds = dto.studentIds?.filter(Boolean) ?? [];

        return await this.prisma.$transaction(async (tx) => {
            const group = await this.groupRepo.createGroup(tx, {
                name: dto.name,
                teacher: {
                    connect: { id: dto.teacherId }
                },
            });

            if (studentIds.length > 0) {
                await this.groupRepo.createStudentGroup(tx,
                    studentIds.map((studentId) => ({
                        studentId,
                        groupId: group.id,
                    }))
                )
            }
            return group;
        })
    }
}
import { Injectable } from "@nestjs/common";
import { GroupRepository } from "../group.service";
import { PrismaService } from "src/prisma/prisma.service";
import { AddStudentsDto } from "../dto/group.dto";

@Injectable()
export class AddStudentUseCase {
    constructor(
        private readonly groupRepo: GroupRepository,
        private readonly prisma: PrismaService,
    ) { }

    async execute(groupId: string, dto: AddStudentsDto) {
        const group = await this.groupRepo.findOne(groupId);

        const studentIds = dto.studentIds?.filter(Boolean) ?? [];

        if (studentIds.length === 0) {
            return group;
        }

        await this.groupRepo.findStudentByIds(studentIds);

        return await this.prisma.$transaction(async (tx) => {
            await this.groupRepo.createStudents(tx, studentIds, groupId);
            return this.groupRepo.findOne(groupId);
        });
    }
}
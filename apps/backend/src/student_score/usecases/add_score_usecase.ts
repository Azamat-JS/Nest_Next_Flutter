import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { StudentScoreRepository } from "../student_score.service";

@Injectable()
export class AddScoreUseCase {
    constructor(private readonly prisma: PrismaService, private readonly studentScoreRepo: StudentScoreRepository) { }

    async execute() { }
}
import { BadRequestException, ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PRISMA_CLIENT } from "src/prisma/prisma.module";
import { PrismaService } from "src/prisma/prisma.service";
import type { TenantScopedPrismaClient } from "src/prisma/tenant-scoping.extension";
import { CreateUserDto } from "../dto/user.dto";

const ALLOWED_CREATIONS: Record<UserRole, UserRole[]> = {
    ADMIN: [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT],
    TEACHER: [UserRole.STUDENT, UserRole.PARENT],
    PARENT: [],
    STUDENT: [],
};

@Injectable()
export class CreateUserUseCase {
    constructor(
        private readonly rawPrisma: PrismaService,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
    ) { }

    async execute(dto: CreateUserDto, creatorRole: UserRole) {
        const normalizedRole = dto.role.toString().toUpperCase() as UserRole;

        if (!ALLOWED_CREATIONS[creatorRole]?.includes(normalizedRole)) {
            throw new ForbiddenException(`${creatorRole} cannot create a ${normalizedRole} account`);
        }

        const existingUser = await this.rawPrisma.users.findUnique({
            where: { phone: dto.phone },
        });
        if (existingUser) {
            throw new BadRequestException('Phone already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        try {
            const user = await this.prisma.users.create({
                data: {
                    ...dto,
                    role: normalizedRole,
                    password: hashedPassword,
                    mustChangePassword: true,
                },
            });

            return {
                id: user.id,
                phone: user.phone,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            };
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Phone already exists');
            }
            throw error;
        }
    }
}

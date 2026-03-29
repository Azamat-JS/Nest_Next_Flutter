import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllUsers() {
        return this.prisma.users.findMany({});
    }

    async createUser(createUserInput: Prisma.UsersCreateInput) {
        return this.prisma.users.create({
            data: {
                ...createUserInput
            }
        })
    }

    async updateUser(id: string, updateUserInput: Prisma.UsersUpdateInput) {

        const foundUser = await this.prisma.users.findUnique({
            where: { id }
        });
        if (!foundUser) {
            throw new Error('User not found');
        }
        return this.prisma.users.update({
            where: { id },
            data: {
                ...updateUserInput,
            }
        })
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllUsers() {
        return this.prisma.users.findMany({});
    }

    async getUserById(id: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        return foundUser;
    }

    async createUser(createUserInput: Prisma.UsersCreateInput) {
        const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
        createUserInput.password = hashedPassword;
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
            throw new NotFoundException('User not found');
        }
        return this.prisma.users.update({
            where: { id },
            data: {
                ...updateUserInput,
            }
        })
    }

    async deleteUser(id: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id }
        })
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        await this.prisma.users.delete({
            where: { id }
        });
        return { message: 'User deleted successfully' };
    }

}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    async getAllUsers() {
        return this.prisma.users.findMany({});
    }

    async getMyProfile(userId: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id: userId }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        return foundUser;
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

    async loginUser(email: string, password: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { email }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            throw new NotFoundException('Invalid credentials');
        }
        const token = this.jwtService.sign({ userId: foundUser.id, email: foundUser.email, username: foundUser.username });
        return { token };
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

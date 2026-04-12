import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from 'src/group/dto/group.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    async getAllUsers(query: PaginationDto) {
        const { limit = 10, page = 1 } = query;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            await this.prisma.users.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                }
            }),
            this.prisma.users.count(),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
                limit,
            }
        }
    }

    async getMyProfile(userId: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id: userId }, select: {
                id: true,
                email: true,
                username: true,
                role: true,
            }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        return foundUser;
    }

    async getUserById(id: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id }, select: {
                id: true,
                email: true,
                username: true,
                role: true
            }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        return foundUser;
    }

    async getAllTeachers() {
        return await this.prisma.users.findMany({ where: { role: "teacher" } });
    }

    async getAllStudents() {
        return await this.prisma.users.findMany({
            where: { role: "student" }, select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                role: true,
            }
        });
    }

    async createUser(createUserInput: Prisma.UsersCreateInput) {
        try {
            const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
            const user = await this.prisma.users.create({
                data: {
                    ...createUserInput,
                    password: hashedPassword
                }
            });

            const accessToken = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
            });

            return {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                },
                accessToken
            }
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new BadRequestException('Username already exists');
            }

            throw error;
        }
    };

    async loginUser(email: string, password: string) {
        const foundUser = await this.prisma.users.findUnique({
            where: { email }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = this.jwtService.sign({ userId: foundUser.id, email: foundUser.email, username: foundUser.username, role: foundUser.role });
        return {
            user: {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username,
                role: foundUser.role,
            },
            accessToken
        }
    }

    async updateUser(id: string, updateUserInput: Prisma.UsersUpdateInput) {
        const foundUser = await this.prisma.users.findUnique({
            where: { id },
        });

        if (!foundUser) {
            throw new NotFoundException('User not found');
        }

        if (typeof updateUserInput.password === 'string') {
            updateUserInput.password = await bcrypt.hash(
                updateUserInput.password,
                10,
            );
        }

        const updatedUser = await this.prisma.users.update({
            where: { id },
            data: updateUserInput,
        });

        return {
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
            },
        };
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

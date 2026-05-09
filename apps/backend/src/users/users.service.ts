import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto } from 'src/lib/shared/dto/pagination.dto';
import { AppConfig } from 'src/lib/config';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService, private readonly config: AppConfig) { }

    async getAllUsers(query: PaginationDto) {
        const { limit = 10, page = 1 } = query;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.users.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    avatarUrl: true,
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
                avatarUrl: true,
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
                avatarUrl: true,
                role: true
            }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        return foundUser;
    }

    async getAllTeachers() {
        return await this.prisma.users.findMany({
            where: { role: UserRole.TEACHER }, select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                role: true,
            }
        });
    }

    async getAllStudents() {
        return await this.prisma.users.findMany({
            where: { role: UserRole.STUDENT }, select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                role: true,
            },
        });
    }

    async indentifyDevice(token: string) {
        try {

        } catch (error) {

        }
    }

    async createUser(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.prisma.users.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                throw new BadRequestException('Email already exists');
            }

            const normalizedRole = createUserDto.role.toUpperCase() as UserRole;
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = await this.prisma.users.create({
                data: {
                    ...createUserDto,
                    role: normalizedRole,
                    password: hashedPassword,
                }
            });

            const accessToken = this.jwtService.sign({
                userId: user.id,
                email: user.email,
                username: user.username,
                role: normalizedRole,
            });

            return {
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

    async loginUser(loginDto: LoginDto) {
        const { email, password } = loginDto;
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

        const payload = {
            userId: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            role: foundUser.role
        };


        const accessToken = this.jwtService.sign(payload, { expiresIn: this.config.JWT_EXPIRES_IN });


        const refreshToken = this.jwtService.sign(payload, { expiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN as any });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await this.prisma.session.create({
            data: {
                refreshToken,
                userId: foundUser.id,
                expiresAt,
                deviceInfo: loginDto.deviceInfo ?? '',
            }
        })
        return {
            accessToken,
            refreshToken,
            user: foundUser,

        }
    }

    async updateAccessToken(oldRefreshToken: string) {
        const session = await this.prisma.session.findFirst({
            where: {
                refreshToken: oldRefreshToken,
                isRevoked: false
            }
        });

        if (!session) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (session.expiresAt < new Date()) {
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.prisma.users.findUnique({
            where: { id: session.userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const payload = {
            userId: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };

        const newAccessToken = await this.jwtService.signAsync(payload, { expiresIn: this.config.JWT_EXPIRES_IN });

        return { accessToken: newAccessToken };
    }


    async updateUser(id: string, updateUserInput: UpdateUserDto) {

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
        if (updateUserInput.role) {
            const normalizedRole = updateUserInput.role.toUpperCase() as UserRole;
            updateUserInput.role = normalizedRole;
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
                role: updateUserInput.role,
                avatarUrl: updatedUser.avatarUrl,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
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

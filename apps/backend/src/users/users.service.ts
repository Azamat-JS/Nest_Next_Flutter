import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto, GetUsersQueryDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { AppConfig } from 'src/lib/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { PRISMA_CLIENT } from 'src/prisma/prisma.module';
import type { TenantScopedPrismaClient } from 'src/prisma/tenant-scoping.extension';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(
        private readonly rawPrisma: PrismaService,
        @Inject(PRISMA_CLIENT) private readonly prisma: TenantScopedPrismaClient,
        private readonly jwtService: JwtService,
        private readonly config: AppConfig,
    ) { }

    async getAllUsers(query: GetUsersQueryDto) {
        const { limit = 10, page = 1, role, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.UsersWhereInput = {
            ...(role && { role }),
            ...(search && {
                OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { phone: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };

        const [data, total] = await Promise.all([
            this.prisma.users.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                    role: true,
                }
            }),
            this.prisma.users.count({ where }),
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
                phone: true,
                firstName: true,
                lastName: true,
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
                phone: true,
                firstName: true,
                lastName: true,
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
                firstName: true,
                lastName: true,
                phone: true,
                avatarUrl: true,
                role: true,
            }
        });
    }

    async getAllStudents() {
        return await this.prisma.users.findMany({
            where: { role: UserRole.STUDENT }, select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
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

    private buildTenantJwtPayload(user: { id: string; phone: string; firstName: string; role: UserRole; tenantId: string; mustChangePassword: boolean }) {
        return {
            userId: user.id,
            phone: user.phone,
            firstName: user.firstName,
            role: user.role,
            tenantId: user.tenantId,
            mustChangePassword: user.mustChangePassword,
            type: 'tenant' as const,
        };
    }

    async loginUser(loginDto: LoginDto) {
        const { phone, password } = loginDto;
        // Tenant is unknown at this point - phone is globally unique across the
        // platform, so this lookup must bypass tenant scoping deliberately.
        const foundUser = await this.rawPrisma.users.findUnique({
            where: { phone }
        });
        if (!foundUser) {
            throw new NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tenant = await this.rawPrisma.tenant.findUnique({ where: { id: foundUser.tenantId } });
        if (!tenant || tenant.status !== 'ACTIVE') {
            throw new UnauthorizedException('This center is not currently active');
        }

        const payload = this.buildTenantJwtPayload(foundUser);

        const accessToken = this.jwtService.sign(payload, { expiresIn: this.config.JWT_EXPIRES_IN });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: this.config.REFRESH_TOKEN_EXPIRES_IN as any });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await this.rawPrisma.session.create({
            data: {
                refreshToken,
                userId: foundUser.id,
                tenantId: foundUser.tenantId,
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
        const session = await this.rawPrisma.session.findFirst({
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

        const user = await this.rawPrisma.users.findUnique({
            where: { id: session.userId }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const payload = this.buildTenantJwtPayload(user);

        const newAccessToken = await this.jwtService.signAsync(payload, { expiresIn: this.config.JWT_EXPIRES_IN });

        return { accessToken: newAccessToken };
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
        const user = await this.prisma.users.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isCurrentValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.users.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });

        return { message: 'Password changed successfully' };
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
            const normalizedRole = updateUserInput.role.toString().toUpperCase() as UserRole;
            updateUserInput.role = normalizedRole;
        }

        const updatedUser = await this.prisma.users.update({
            where: { id },
            data: updateUserInput,
        });

        return {
            user: {
                id: updatedUser.id,
                phone: updatedUser.phone,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
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

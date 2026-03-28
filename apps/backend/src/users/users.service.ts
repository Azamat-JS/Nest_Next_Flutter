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
}

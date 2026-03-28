import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    };

    async onModuleInit(): Promise<void> {
        await this.$connect();
        console.log('Prisma connected to the DB');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        console.log('Prisma disconnected from the DB');
    }
}

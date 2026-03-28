import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super({
            adapter: new PrismaPg({
                connectionString: process.env.DATABASE_URL!,
            }),
        });
    }

    async onModuleInit(): Promise<void> {
        await this.$connect();
        console.log('Prisma connected to the DB');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        console.log('Prisma disconnected from the DB');
    }
}

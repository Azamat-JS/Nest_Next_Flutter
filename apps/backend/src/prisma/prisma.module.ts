import { Global, Module } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from './prisma.service';
import { buildTenantScopedClient } from './tenant-scoping.extension';

export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');

@Global()
@Module({
    providers: [
        PrismaService,
        {
            provide: PRISMA_CLIENT,
            inject: [PrismaService, ClsService],
            useFactory: (prisma: PrismaService, cls: ClsService) => buildTenantScopedClient(prisma, cls),
        },
    ],
    exports: [PrismaService, PRISMA_CLIENT],
})
export class PrismaModule { }

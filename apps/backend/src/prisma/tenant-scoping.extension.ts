import { ClsService } from 'nestjs-cls';
import { TENANT_ID_KEY } from 'src/lib/tenant/tenant-context.service';
import { PrismaService } from './prisma.service';

// Models that carry a tenantId column and must always be scoped to the
// caller's tenant. Tenant/PlatformAdmin are intentionally excluded - they are
// managed exclusively by the platform-admin (SuperAdmin) side of the app.
const TENANT_SCOPED_MODELS = new Set([
    'Users',
    'Session',
    'DeviceToken',
    'ParentStudent',
    'StudentGroup',
    'Groups',
    'ScoreEvent',
    'StudentScore',
    'StudentPayment',
    'Chat',
    'ChatMember',
    'Message',
    'MessageStatus',
    'Attachment',
    'WaitingList',
]);

const WHERE_FILTERED_OPERATIONS = new Set([
    'findMany',
    'findFirst',
    'findFirstOrThrow',
    'findUnique',
    'findUniqueOrThrow',
    'update',
    'updateMany',
    'delete',
    'deleteMany',
    'count',
    'aggregate',
    'groupBy',
]);

function requireTenantId(cls: ClsService, model: string, operation: string): string {
    const tenantId = cls.get<string>(TENANT_ID_KEY);
    if (!tenantId) {
        throw new Error(
            `Tenant context is missing for ${model}.${operation} - this operation must run within an authenticated tenant request, or the tenantId must be supplied explicitly`,
        );
    }
    return tenantId;
}

export function buildTenantScopedClient(prisma: PrismaService, cls: ClsService) {
    return prisma.$extends({
        name: 'tenant-scoping',
        query: {
            $allModels: {
                async $allOperations({ model, operation, args, query }) {
                    if (!TENANT_SCOPED_MODELS.has(model)) {
                        return query(args);
                    }

                    const writeArgs = args as { data?: any; where?: any; create?: any };

                    if (operation === 'create') {
                        if (!writeArgs.data?.tenantId && !writeArgs.data?.tenant) {
                            writeArgs.data = { ...writeArgs.data, tenantId: requireTenantId(cls, model, operation) };
                        }
                        return query(args);
                    }

                    if (operation === 'createMany') {
                        const rows = Array.isArray(writeArgs.data) ? writeArgs.data : [writeArgs.data];
                        const tenantId = rows.some((row: any) => !row?.tenantId)
                            ? requireTenantId(cls, model, operation)
                            : undefined;
                        writeArgs.data = rows.map((row: any) => (row?.tenantId ? row : { ...row, tenantId }));
                        return query(args);
                    }

                    if (operation === 'upsert') {
                        const tenantId = writeArgs.where?.tenantId ?? requireTenantId(cls, model, operation);
                        writeArgs.where = { ...writeArgs.where, tenantId };
                        if (!writeArgs.create?.tenantId && !writeArgs.create?.tenant) {
                            writeArgs.create = { ...writeArgs.create, tenantId };
                        }
                        return query(args);
                    }

                    if (WHERE_FILTERED_OPERATIONS.has(operation)) {
                        const tenantId = writeArgs.where?.tenantId ?? requireTenantId(cls, model, operation);
                        writeArgs.where = { ...writeArgs.where, tenantId };
                        return query(args);
                    }

                    return query(args);
                },
            },
        },
    });
}

export type TenantScopedPrismaClient = ReturnType<typeof buildTenantScopedClient>;

// The type Prisma actually hands to an interactive `$transaction(async (tx) => ...)`
// callback on the extended client - same shape as the client minus the
// connection/extension-management methods that aren't valid mid-transaction.
export type TenantScopedTransactionClient = Omit<
    TenantScopedPrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

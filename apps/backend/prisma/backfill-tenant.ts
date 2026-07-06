import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const TENANT_NAME = process.env.BACKFILL_TENANT_NAME ?? 'Default Center';
const SUPERADMIN_PHONE = process.env.SUPERADMIN_PHONE;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

async function main() {
    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });

    const tenant = await prisma.tenant.create({
        data: { name: TENANT_NAME },
    });
    console.log(`Created tenant "${tenant.name}" (${tenant.id})`);

    const models = [
        'users',
        'session',
        'deviceToken',
        'parentStudent',
        'studentGroup',
        'groups',
        'scoreEvent',
        'studentScore',
        'studentPayment',
        'chat',
        'chatMember',
        'message',
        'messageStatus',
        'attachment',
    ] as const;

    for (const model of models) {
        const client = (prisma as any)[model];
        const result = await client.updateMany({
            where: { tenantId: null },
            data: { tenantId: tenant.id },
        });
        console.log(`Backfilled ${result.count} row(s) in ${model}`);
    }

    if (SUPERADMIN_PHONE && SUPERADMIN_PASSWORD) {
        const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
        const admin = await prisma.platformAdmin.upsert({
            where: { phone: SUPERADMIN_PHONE },
            update: { password: hashed },
            create: { phone: SUPERADMIN_PHONE, password: hashed },
        });
        console.log(`Seeded PlatformAdmin (${admin.phone})`);
    } else {
        console.log(
            'Skipped PlatformAdmin seeding: set SUPERADMIN_PHONE and SUPERADMIN_PASSWORD env vars to seed one.',
        );
    }

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

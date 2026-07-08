import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const SUPERADMIN_PHONE = process.env.SUPERADMIN_PHONE;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

async function main() {
    if (!SUPERADMIN_PHONE || !SUPERADMIN_PASSWORD) {
        console.error('Set SUPERADMIN_PHONE and SUPERADMIN_PASSWORD env vars to seed a PlatformAdmin.');
        process.exit(1);
    }

    const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });

    const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);
    const admin = await prisma.platformAdmin.upsert({
        where: { phone: SUPERADMIN_PHONE },
        update: { password: hashed },
        create: { phone: SUPERADMIN_PHONE, password: hashed },
    });

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

import * as dotenv from "dotenv";
dotenv.config();

import { prisma } from "../app/lib/db";

async function main() {
    console.log("=== Όλα τα indexes ===");
    const indexes = await prisma.$queryRaw`
        SELECT tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
    `;
    console.log(JSON.stringify(indexes, null, 2));

    console.log("=== Όλα τα CHECK constraints ===");
    const checks = await prisma.$queryRaw`
        SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(oid) AS definition
        FROM pg_constraint
        WHERE contype = 'c' AND connamespace = 'public'::regnamespace;
    `;
    console.log(JSON.stringify(checks, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
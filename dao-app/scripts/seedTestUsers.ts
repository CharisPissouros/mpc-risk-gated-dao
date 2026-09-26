import * as dotenv from "dotenv";
dotenv.config();    

import { prisma } from "../app/lib/db";

async function main() {
    const users = [
        { walletAddress: "0x1111111111111111111111111111111111111a", email: "usera@example.com", capital: 5000, riskLevel: 20, credit: 80 },
        { walletAddress: "0x2222222222222222222222222222222222222b", email: "userb@example.com", capital: 6000, riskLevel: 15, credit: 75 },
        { walletAddress: "0x3333333333333333333333333333333333333c", email: "userc@example.com", capital: 4000, riskLevel: 25, credit: 70 },
    ];

    for (const u of users) {
        const created = await prisma.user.create({ data: u });
        console.log(`Created user: id=${created.id}, wallet=${created.walletAddress}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
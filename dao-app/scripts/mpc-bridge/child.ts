import * as dotenv from "dotenv";
dotenv.config();

import { prisma } from "../../app/lib/db";
import * as fs from "fs";
import * as path from "path";

async function main() {
     const partyIndex = process.argv[2];
    const userId = parseInt(process.argv[3]);

    if (partyIndex === undefined || isNaN(userId)) {
        console.error("Usage: tsx child.ts <partyIndex> <userId>");
        process.exit(1);
    }

    //only one user
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        console.error(`User ${userId} not found`);
        process.exit(1);
    }

    //convert to int like the mpc is waiting
    const risk = user.riskLevel;
    const capital = Math.round(Number(user.capital));
     const credit = user.credit;

    const inputLine = `${risk} ${capital} ${credit}\n`;

    const MPSPDZ_PATH = process.env.MPSPDZ_PATH;
    if(!MPSPDZ_PATH){
         throw new Error("enviroment path wrong");
    }
    const outputFile = path.join(MPSPDZ_PATH, "Player-Data", `Input-P${partyIndex}-0`);

     fs.writeFileSync(outputFile, inputLine);
    console.log(`Party ${partyIndex} (user ${userId}): wrote input file`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

import { spawn } from "child_process";
import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

const PARTICIPANTS = [
    { party: 0, userId: 2 },
    { party: 1, userId: 3 },
    { party: 2, userId: 4 },
];

function runCommand(command: string, args: string[], cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { cwd });
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => { stdout += data.toString(); });
        proc.stderr.on("data", (data) => { stderr += data.toString(); });

        proc.on("close", (code) => {
            if (code === 0) resolve(stdout);
            else reject(new Error(Exit code ${code}: ${stderr}));
        });
    });
}

async function submitToChain(riskScore: number, participants: number[]) {
    console.log("=== Βήμα 4: Υποβολή on-chain ===");

    const PLUGIN_ADDRESS = "0x929679FdE70032c19B26234b7F8cccc4cE023418";
    const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL!;
    const ORACLE_PRIVATE_KEY = process.env.PRIVATE_KEY!;

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    const wallet = new ethers.Wallet(ORACLE_PRIVATE_KEY, provider);

    const CustomPluginABI = [
        "function submitRiskData(uint256 _RiskScore, bytes32 _datahash) external"
    ];

    const plugin = new ethers.Contract(PLUGIN_ADDRESS, CustomPluginABI, wallet);

    const datahash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify({ participants, timestamp: Date.now() }))
    );

    const tx = await plugin.submitRiskData(riskScore, datahash);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);
}

async function main() {
    console.log("=== Βήμα 1: Spawning 3 απομονωμένα child processes ===");

    await Promise.all(
        PARTICIPANTS.map(({ party, userId }) =>
            runCommand("npx", ["tsx", "scripts/mpc-bridge/child.ts", String(party), String(userId)])
                .then((output) => console.log(output.trim()))
        )
    );

    console.log("=== Βήμα 2: Εκτέλεση MPC υπολογισμού ===");

    const MPSPDZ_PATH = "/home/charis/aragon/MPC-layer/MP-SPDZ";
    const mpcOutput = await runCommand(
        "Scripts/shamir.sh",
        ["-N", "3", "-T", "1", "Custom_MPC_protocol"],
        MPSPDZ_PATH
    );
    console.log(mpcOutput);

    console.log("=== Βήμα 3: Ανάλυση αποτελέσματος ===");
    const healthIndexMatch = mpcOutput.match(/System Health Index:\s*(-?\d+)/);
    const approvedMatch = mpcOutput.match(/Investment Approved:\s*(\d)/);

    if (!healthIndexMatch || !approvedMatch) {
        throw new Error("Δεν βρέθηκε αναμενόμενη έξοδος στο MPC output");
    }

    const healthIndex = parseInt(healthIndexMatch[1]);
    console.log("Parsed Health Index:", healthIndex);
    if (approvedMatch[1] !== "1"){
        throw new Error("MPC did not approve");

    }
    const riskscore = Math.max(0 ,Math.min(100 , 100-healthIndex));
    console.log("risk score for on chain" , riskscore);

    await submitToChain(riskscore, PARTICIPANTS.map(p => p.userId));

    console.log(" Πλήρες MPC → oracle bridge ολοκληρώθηκε!");
}

main().catch((e) => {console.error(e); process.exit(1); });

import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    const PLUGIN_ADDRESS = "0x929679FdE70032c19B26234b7F8cccc4cE023418";

    const plugin = await ethers.getContractAt("CustomPlugin", PLUGIN_ADDRESS);

    const testRiskScore = 50;
    const testDataHash = ethers.keccak256(ethers.toUtf8Bytes("test-mpc-output-placeholder"));

    // Πρώτα static call, ίδια ασφαλής μεθοδολογία
    try {
        await plugin.submitRiskData.staticCall(testRiskScore, testDataHash);
        console.log("Static call succeeded!");
    } catch (err: any) {
        console.log("Static call FAILED");
        console.log("err.message:", err.message);
        console.log("err.data:", err.data);
        return;
    }

    const tx = await plugin.submitRiskData(testRiskScore, testDataHash);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Confirmed in block:", receipt.blockNumber);

    // Επιβεβαίωση: διάβασε πίσω το LatestRiskData
    const latest = await plugin.LatestRiskData();
    console.log("LatestRiskData:", latest);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
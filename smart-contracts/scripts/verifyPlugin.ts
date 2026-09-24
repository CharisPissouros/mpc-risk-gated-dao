import { ethers } from "hardhat";

async function main() {
    const PLUGIN_ADDRESS = "0x929679FdE70032c19B26234b7F8cccc4cE023418";

    const plugin = await ethers.getContractAt("CustomPlugin", PLUGIN_ADDRESS);

    console.log("oracle:", await plugin.oracle());
    console.log("tokenforvoting:", await plugin.tokenforvoting());
    console.log("maxAllowedRiskScore:", await plugin.maxAllowedRiskScore());
    console.log("maxRiskDataAge:", await plugin.maxRiskDataAge());
    console.log("dao:", await plugin.dao());
    console.log("LatestRiskData:", await plugin.LatestRiskData());
}
    
main().catch(console.error);

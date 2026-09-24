import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Checking permissions for:", deployer.address);

    const DAO_ADDRESS = "0xa843D2c69d16B5Abe56Be339C2f0693290E7c797"; // επιβεβαίωσε ότι είναι σωστό checksum

    const DAO_ABI_CHECK = [
        "function isGranted(address _where, address _who, bytes32 _permissionId, bytes memory _data) view returns (bool)"
    ];

    const daoCheck = new ethers.Contract(DAO_ADDRESS, DAO_ABI_CHECK, deployer);

    const EXECUTE_PERMISSION_ID = ethers.id("EXECUTE_PERMISSION");
    const hasExecute = await daoCheck.isGranted(DAO_ADDRESS, deployer.address, EXECUTE_PERMISSION_ID, "0x");
    console.log("Has EXECUTE_PERMISSION:", hasExecute);

    const ROOT_PERMISSION_ID = ethers.id("ROOT_PERMISSION");
    const hasRoot = await daoCheck.isGranted(DAO_ADDRESS, deployer.address, ROOT_PERMISSION_ID, "0x");
    console.log("Has ROOT_PERMISSION:", hasRoot);

        const APPLY_INSTALLATION_PERMISSION_ID = ethers.id("APPLY_INSTALLATION_PERMISSION");
    const hasApplyInstall = await daoCheck.isGranted(DAO_ADDRESS, deployer.address, APPLY_INSTALLATION_PERMISSION_ID, "0x");
    console.log("Has APPLY_INSTALLATION_PERMISSION:", hasApplyInstall);

    const PLUGIN_SETUP_PROCESSOR_ADDRESS = "0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f";
    const pspHasRoot = await daoCheck.isGranted(DAO_ADDRESS, PLUGIN_SETUP_PROCESSOR_ADDRESS, ROOT_PERMISSION_ID, "0x");
    console.log("PSP has ROOT_PERMISSION on DAO:", pspHasRoot);
}

main().catch(console.error);
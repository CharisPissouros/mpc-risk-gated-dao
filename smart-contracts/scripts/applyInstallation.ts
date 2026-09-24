import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    const DAO_ADDRESS = "0xa843D2c69d16B5Abe56Be339C2f0693290E7c797"; // το ίδιο, ήδη σωστό, ακριβές address
    const PLUGIN_REPO_ADDRESS = "0x7E77cF42FE296977459E4407054f5D852171DFeD";
    const PLUGIN_SETUP_PROCESSOR_ADDRESS = "0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f";
    const PLUGIN_ADDRESS = "0x929679FdE70032c19B26234b7F8cccc4cE023418";

    // ========== ΦΑΣΗ 4: applyInstallation (χωρίς grant, ήδη το έχουμε) ==========

    const permissions = [
        {
            operation: 0,
            where: "0x929679FdE70032c19B26234b7F8cccc4cE023418",
            who: "0x9271d2A7599de776f11c3C13207586100152a537",
            condition: "0x0000000000000000000000000000000000000000",
            permissionId: "0x4991fefc0b83239922e9c099dca546e1f2ee76ac350bf6b34098199807fe9a7f"
        },
        {
            operation: 0,
            where: "0x929679FdE70032c19B26234b7F8cccc4cE023418",
            who: "0x9271d2A7599de776f11c3C13207586100152a537",
            condition: "0x0000000000000000000000000000000000000000",
            permissionId: "0x461b0f5e5f6c4592cc92d5a18b69d3813ad2d24fb7bb31af5dc8f35205eb40ef"
        },
        {
            operation: 0,
            where: "0x0FDB26a7506C15270ADa2cA9117c1D95cC092134",
            who: "0x929679FdE70032c19B26234b7F8cccc4cE023418",
            condition: "0x0000000000000000000000000000000000000000",
            permissionId: "0x8c433a4cd6b51969eca37f974940894297b9fcf4b282a213fea5cd8f85289c90"
        }
    ];

    const helpersHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(["address[]"], [[]])
    );

    const PluginSetupProcessorABI = [
        {
            "inputs": [
                { "internalType": "address", "name": "_dao", "type": "address" },
                {
                    "components": [
                        {
                            "components": [
                                {
                                    "components": [
                                        { "internalType": "uint8", "name": "release", "type": "uint8" },
                                        { "internalType": "uint16", "name": "build", "type": "uint16" }
                                    ],
                                    "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple"
                                },
                                { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }
                            ],
                            "internalType": "struct PluginSetupRef", "name": "pluginSetupRef", "type": "tuple"
                        },
                        { "internalType": "address", "name": "plugin", "type": "address" },
                        {
                            "components": [
                                { "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" },
                                { "internalType": "address", "name": "where", "type": "address" },
                                { "internalType": "address", "name": "who", "type": "address" },
                                { "internalType": "address", "name": "condition", "type": "address" },
                                { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }
                            ],
                            "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]"
                        },
                        { "internalType": "bytes32", "name": "helpersHash", "type": "bytes32" }
                    ],
                    "internalType": "struct PluginSetupProcessor.ApplyInstallationParams", "name": "_params", "type": "tuple"
                }
            ],
            "name": "applyInstallation",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const pluginSetupProcessor = new ethers.Contract(
        PLUGIN_SETUP_PROCESSOR_ADDRESS,
        PluginSetupProcessorABI,
        deployer
    );

    const applyParams = {
        pluginSetupRef: {
            versionTag: { release: 1, build: 1 },
            pluginSetupRepo: PLUGIN_REPO_ADDRESS
        },
        plugin: PLUGIN_ADDRESS,
        permissions: permissions,
        helpersHash: helpersHash
    };

    try {
        await pluginSetupProcessor.applyInstallation.staticCall(DAO_ADDRESS, applyParams);
        console.log("applyInstallation static call succeeded!");
    } catch (err: any) {
        console.log("applyInstallation static call FAILED");
        console.log("err.message:", err.message);
        console.log("err.data:", err.data);
        return;
    }

    const tx = await pluginSetupProcessor.applyInstallation(DAO_ADDRESS, applyParams);
    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("🎉 Plugin installed at:", PLUGIN_ADDRESS);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
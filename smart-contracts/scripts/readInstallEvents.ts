import { ethers } from "hardhat";

async function main() {
    const txHash = "0x3e448f7ba05145440adf2118ff9a6690e3d0200c8622e359959a6144cd473fd4";

    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (!receipt) {
        console.log("Receipt not found");
        return;
    }

    console.log("Found receipt, number of logs:", receipt.logs.length);

    const PluginSetupProcessorABI = [
        {
            "anonymous": false,
            "inputs": [
                { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
                { "indexed": true, "internalType": "address", "name": "dao", "type": "address" },
                { "indexed": false, "internalType": "bytes32", "name": "preparedSetupId", "type": "bytes32" },
                { "indexed": true, "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" },
                {
                    "components": [
                        { "internalType": "uint8", "name": "release", "type": "uint8" },
                        { "internalType": "uint16", "name": "build", "type": "uint16" }
                    ],
                    "indexed": false, "internalType": "struct PluginRepo.Tag", "name": "versionTag", "type": "tuple"
                },
                { "indexed": false, "internalType": "bytes", "name": "data", "type": "bytes" },
                { "indexed": false, "internalType": "address", "name": "plugin", "type": "address" },
                {
                    "components": [
                        { "internalType": "address[]", "name": "helpers", "type": "address[]" },
                        {
                            "components": [
                                { "internalType": "enum PermissionLib.Operation", "name": "operation", "type": "uint8" },
                                { "internalType": "address", "name": "where", "type": "address" },
                                { "internalType": "address", "name": "who", "type": "address" },
                                { "internalType": "address", "name": "condition", "type": "address" },
                                { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }
                            ],
                            "internalType": "struct PermissionLib.MultiTargetPermission[]", "name": "permissions", "type": "tuple[]"
                        }
                    ],
                    "indexed": false, "internalType": "struct IPluginSetup.PreparedSetupData", "name": "preparedSetupData", "type": "tuple"
                }
            ],
            "name": "InstallationPrepared",
            "type": "event"
        }
    ];

    const iface = new ethers.Interface(PluginSetupProcessorABI);

    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed) {
                console.log("=== Event:", parsed.name, "===");
                console.log("plugin:", parsed.args.plugin);
                console.log("preparedSetupId:", parsed.args.preparedSetupId);
                console.log("helpers:", parsed.args.preparedSetupData.helpers);
                console.log("permissions:", parsed.args.preparedSetupData.permissions);
            }
        } catch {
            // log από άλλο contract, αγνοούμε σιωπηλά
        }
    }
}

main().catch(console.error);
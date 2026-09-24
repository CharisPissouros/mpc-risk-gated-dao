import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // ========== ΣΤΑΘΕΡΕΣ από τα ήδη ολοκληρωμένα βήματα ==========
    const DAO_ADDRESS = "0xa843D2c69d16B5Abe56Be339C2f0693290E7c797"; // ήδη συμπληρωμένο στο δικό σου αρχείο
    const TOKEN_VOTING_ADDRESS = "0x0FDB26a7506C15270ADa2cA9117c1D95cC092134";
    const PLUGIN_REPO_ADDRESS = "0x7E77cF42FE296977459E4407054f5D852171DFeD";
    const PLUGIN_SETUP_PROCESSOR_ADDRESS = "0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f";

    const MAX_ALLOWED_RISK_SCORE = 70;
    const MAX_RISK_DATA_AGE = 86400;

    // ========== ΦΑΣΗ 3: prepareInstallation ==========

    // Σειρά: oracle ΠΡΩΤΑ, μετά tokenVoting (ταιριάζει με CustomPlugin.sol decode)
    const installData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256", "uint256"],
        [deployer.address, TOKEN_VOTING_ADDRESS, MAX_ALLOWED_RISK_SCORE, MAX_RISK_DATA_AGE]
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
                                    "internalType": "struct PluginRepo.Tag",
                                    "name": "versionTag",
                                    "type": "tuple"
                                },
                                { "internalType": "contract PluginRepo", "name": "pluginSetupRepo", "type": "address" }
                            ],
                            "internalType": "struct PluginSetupRef",
                            "name": "pluginSetupRef",
                            "type": "tuple"
                        },
                        { "internalType": "bytes", "name": "data", "type": "bytes" }
                    ],
                    "internalType": "struct PluginSetupProcessor.PrepareInstallationParams",
                    "name": "_params",
                    "type": "tuple"
                }
            ],
            "name": "prepareInstallation",
            "outputs": [
                { "internalType": "address", "name": "plugin", "type": "address" },
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
                            "internalType": "struct PermissionLib.MultiTargetPermission[]",
                            "name": "permissions",
                            "type": "tuple[]"
                        }
                    ],
                    "internalType": "struct IPluginSetup.PreparedSetupData",
                    "name": "preparedSetupData",
                    "type": "tuple"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    const pluginSetupProcessor = new ethers.Contract(
        PLUGIN_SETUP_PROCESSOR_ADDRESS,
        PluginSetupProcessorABI,
        deployer
    );

    const prepareParams = {
        pluginSetupRef: {
            versionTag: { release: 1, build: 1 },
            pluginSetupRepo: PLUGIN_REPO_ADDRESS
        },
        data: installData
    };

    // ΒΗΜΑ Α: static call πρώτα, για επιβεβαίωση (μηδενικό gas cost)
    try {
        const result = await pluginSetupProcessor.prepareInstallation.staticCall(
            DAO_ADDRESS,
            prepareParams
        );
        console.log("Static call succeeded. Predicted plugin address:", result.plugin);
    } catch (err: any) {
        console.log("Static call FAILED — stopping before real transaction.");
        console.log("err.message:", err.message);
        return; // σταματάμε εδώ αν αποτύχει, δεν προχωράμε σε πραγματικό tx
    }

    // ΒΗΜΑ Β: πραγματικό transaction
    const tx = await pluginSetupProcessor.prepareInstallation(
        DAO_ADDRESS,
        prepareParams
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);

    // ΒΗΜΑ Γ: decode των events για να πάρουμε plugin address + helpers/permissions
    console.log("=== Decoded events ===");
    for (const log of receipt.logs) {
        try {
            const parsed = pluginSetupProcessor.interface.parseLog(log);
            if (parsed) {
                console.log("Event:", parsed.name);
                console.log("Args:", parsed.args);
            }
        } catch {
            // log από άλλο contract (π.χ. DAO permission events) — αγνοούμε
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
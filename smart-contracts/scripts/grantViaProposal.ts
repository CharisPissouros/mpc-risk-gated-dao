import { ethers } from "hardhat";
import { TokenVotingABI } from "@aragon/token-voting-plugin-artifacts";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    const DAO_ADDRESS = "0xa843D2c69d16B5Abe56Be339C2f0693290E7c797"; // επιβεβαίωσε το ίδιο, ακριβές address
    const TOKEN_VOTING_ADDRESS = "0x0FDB26a7506C15270ADa2cA9117c1D95cC092134";
    const PLUGIN_SETUP_PROCESSOR_ADDRESS = "0xC24188a73dc09aA7C721f96Ad8857B469C01dC9f";

    const ROOT_PERMISSION_ID = ethers.id("ROOT_PERMISSION");

    // ΒΗΜΑ 1: Encode το "grant" call — δίνει ROOT_PERMISSION στο PSP, πάνω στο DAO
    const DAO_ABI = [
        "function grant(address _where, address _who, bytes32 _permissionId) external"
    ];
    const daoInterface = new ethers.Interface(DAO_ABI);
    const grantCalldata = daoInterface.encodeFunctionData("grant", [
        DAO_ADDRESS,                       // where: το DAO
        PLUGIN_SETUP_PROCESSOR_ADDRESS,     // who: το PSP
        ROOT_PERMISSION_ID                  // permissionId: ROOT
    ]);

    // ΒΗΜΑ 2: Η Action που θα περιέχει το proposal
    const actions = [
        {
            to: DAO_ADDRESS,
            value: 0,
            data: grantCalldata
        }
    ];

    // ΒΗΜΑ 3: Metadata
    const metadata = ethers.toUtf8Bytes(JSON.stringify({
        title: "Grant ROOT_PERMISSION to PluginSetupProcessor",
        description: "Allows PSP to apply plugin installation permissions on the DAO"
    }));

    // ΒΗΜΑ 4: Contract instance του TokenVoting
    const tokenVoting = new ethers.Contract(TOKEN_VOTING_ADDRESS, TokenVotingABI, deployer);

    // ΒΗΜΑ 5: createProposal — πλήρες signature (λόγω overload)
    const createProposalFn = tokenVoting.getFunction(
        "createProposal(bytes,(address,uint256,bytes)[],uint256,uint64,uint64,uint8,bool)"
    );

    try {
        await createProposalFn.staticCall(
            metadata,
            actions,
            0,      // allowFailureMap
            0,      // startDate (0 = now)
            0,      // endDate (0 = minDuration default)
            2,      // voteOption: Yes
            true    // tryEarlyExecution
        );
        console.log("Static call succeeded!");
    } catch (err: any) {
        console.log("Static call FAILED");
        console.log("err.message:", err.message);
        console.log("err.data:", err.data);
        return;
    }

    const tx = await createProposalFn(
        metadata,
        actions,
        0,
        0,
        0,
        2,
        true
    );

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    console.log("🎉 Proposal created, voted, and (hopefully) executed!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
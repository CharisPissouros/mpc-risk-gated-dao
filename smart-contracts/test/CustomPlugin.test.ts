import {expect} from "chai";
import {ethers} from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

async function deployFixture () {

    const [oracle ,randomUser] = await ethers.getSigners();
    const ORACLE_PERMISSION_ID = ethers.id("ORACLE_PERMISSION_ID");
    const CREATE_PROPOSAL_PERMISSION_ID = ethers.id("CREATE_PROPOSAL_PERMISSION_ID");

    

    const daoFactory = await ethers.getContractFactory("DAO");
    const dao = await daoFactory.deploy();
    await dao.waitForDeployment();



     const initData = daoFactory.interface.encodeFunctionData(("initialize"),[
        "0x",
        oracle.address,
        ethers.ZeroAddress,
        ""
    ]);

   

    
    //mock dao proxy
    const proxyFactory = await ethers.getContractFactory("ERC1967Proxy") ;
    const  proxy = await proxyFactory.deploy(dao,initData);
    await proxy.waitForDeployment();
    const daoAtProxy = daoFactory.attach(await proxy.getAddress());
    //mocktokenvoting implementaion
    const mockTokenVotingFactory = await ethers.getContractFactory("MockTokenVoting");
    const mockTokenVoting = await mockTokenVotingFactory.deploy(await daoAtProxy.getAddress());
    await mockTokenVoting.waitForDeployment();
    //customplugin implementation
    const CustomPluginFactory = await ethers.getContractFactory("CustomPlugin");
    const CustomPlugin = await CustomPluginFactory.deploy();
    await CustomPlugin.waitForDeployment();
  

    //customplguin encoded intialize data
     const customData = CustomPluginFactory.interface.encodeFunctionData(("initialize") , [
       await daoAtProxy.getAddress(),
       await mockTokenVoting.getAddress(),
       oracle.address,
       70,
       86400


    ]);
    

    //customplugin proxy 
    const CustomPluginProxy = await proxyFactory.deploy(
        await CustomPlugin.getAddress(),
        customData
    );
    await CustomPluginProxy.waitForDeployment();
    const customPlugin = CustomPluginFactory.attach(await CustomPluginProxy.getAddress());

    await daoAtProxy.connect(oracle).grant(
        await customPlugin.getAddress(),
        oracle.address,
        ORACLE_PERMISSION_ID
    );

    await daoAtProxy.connect(oracle).grant(
        await customPlugin.getAddress(),
        oracle.address,
        CREATE_PROPOSAL_PERMISSION_ID
    );

    return{ daoAtProxy, oracle , randomUser , mockTokenVoting ,customPlugin};

}

 describe("fixture sanity check" , () =>  {
        it("should deploy virtual DAO in virtual blockchain" , async() =>{
            const {daoAtProxy} = await deployFixture();
            expect(await daoAtProxy.getAddress()).to.not.equal(ethers.ZeroAddress);
        });
     });

 describe("SubmitRiskData" , () =>{
    it("should reject submission from a non oracle wallet" , async()=>{

        const {customPlugin ,randomUser} =await deployFixture();
        await   expect(customPlugin.connect(randomUser).submitRiskData(50, ethers.ZeroHash)).to.be.reverted;
        
    });

    it("should reject a risk score that is too high" , async() =>{

        const {customPlugin , oracle} = await deployFixture();
        await expect(customPlugin.connect(oracle).submitRiskData(100,ethers.ZeroHash)).to.be.revertedWith("Invalid risk score , too high !");

    });

    it("should allow the oracle to submit valid risk score" , async() =>{

        const {customPlugin ,oracle} = await deployFixture();
        const tx =await customPlugin.connect(oracle).submitRiskData(50,ethers.ZeroHash);
        await tx.wait();

        const latest = await customPlugin.LatestRiskData();
        expect(latest.RiskScore).to.equal(50);
    });
    });

    describe("createInvestmentProposal" , () =>{
        it("should reject a call from a non-oracle wallet" , async() =>{

            const {customPlugin , randomUser} = await deployFixture();
            await expect(customPlugin.connect(randomUser).createInvestmentProposal(
                randomUser.address,
                30,
                "0x",
                "0x",
                "test")).to.be.reverted;
            });

        it("should revert on zero address as a target" , async() =>{
            
            const {customPlugin , oracle} = await deployFixture();
            await expect(customPlugin.connect(oracle).createInvestmentProposal(
                "0x0000000000000000000000000000000000000000",
                30,
                "0x",
                "0x",
                "test")).to.be.revertedWith("Invalid target !");
        });

        it("should reject zero amount" , async() =>{

            const {customPlugin , oracle} =await deployFixture();
            await expect(customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                0,
                "0x",
                "0x",
                "test"
            )).to.be.revertedWith("amount must be grater than 0 ");

        });

          it("should reject to encode negative amount" , async() =>{

            const {customPlugin , oracle} =await deployFixture();
            await expect(customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                -10,
                "0x",
                "0x",
                "test"
            )).to.be.rejected;

        });

        it("should reject when no risk data submited" , async() =>{

            const {customPlugin , oracle} = await deployFixture();
            await expect(customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                30,
                "0x",
                "0x",
                "test"  
            )).to.be.revertedWith("No risk data");

        });

        it("should reject stale risk data" , async() =>{

            const {customPlugin , oracle} = await deployFixture();

            await customPlugin.connect(oracle).submitRiskData(50 ,ethers.ZeroHash);

            await time.increase(86401);

            await expect(customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                20,
                "0x",
                "0x",
                "test"
            )).to.be.revertedWith("Risk data is too old");
       
        });

        it("should create a new proposal when everything is valid" , async() =>{

            const {customPlugin , oracle} = await deployFixture();

            await customPlugin.connect(oracle).submitRiskData(50 ,ethers.ZeroHash);

            await time.increase(840);

            const proposaltx = await customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                50,
                "0x",
                "0x",
                "test"
            );

            await proposaltx.wait();

            const proposal= await customPlugin.InvestmentProposals(0);
            expect(proposal.creator).to.equal(oracle.address);
            expect(proposal.amount).to.equal(50);
            expect(proposal.target).to.equal(oracle.address);
            expect(proposal.riskScore).to.equal(50);
            expect(proposal.executed).to.equal(false);
            expect(proposal.externalProposalId).to.equal(1);
        });
    
    });

    describe("executeInvestment" , () => {
        it("should reject a proposal thath doesnt exist" , async() =>{

            const {customPlugin , randomUser} = await deployFixture();
            await expect(customPlugin.connect(randomUser).executeInvestment(999)).to.be.revertedWith("there is no such proposal");

        });

        it("should reject an already executed proposal" , async() =>{

            const {customPlugin ,oracle, randomUser} = await deployFixture();
            
            await customPlugin.connect(oracle).submitRiskData(60,ethers.ZeroHash);

            await customPlugin.connect(oracle).createInvestmentProposal(
                randomUser.address,
                60,
                "0x",
                "0x",
                "test"
            );

            const tx = await customPlugin.connect(randomUser).executeInvestment(0);
            await tx.wait();

            await expect(customPlugin.connect(randomUser).executeInvestment(0)).to.be.revertedWith("the proposal is allready executed ");     
        
        });

        it("should reject when the proposal cannot be executed" , async() =>{

            const {customPlugin ,oracle , randomUser , mockTokenVoting} = await deployFixture();
           
            await customPlugin.connect(oracle).submitRiskData(30 , ethers.ZeroHash);
            await customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                30,
                "0x",
                "0x",
                "test"
            );

            await mockTokenVoting.setCanExecute(false);

            await expect(customPlugin.connect(randomUser).executeInvestment(0)).to.be.revertedWith("You cant execute this proposal");
       
        });

        it("should execute a valid proposal" , async() =>{

            const {customPlugin , oracle , randomUser} = await deployFixture();
            await customPlugin.connect(oracle).submitRiskData(30 , ethers.ZeroHash);
            await customPlugin.connect(oracle).createInvestmentProposal(
                oracle.address,
                30,
                "0x",
                "0x",
                "test"
            );

            const tx = await customPlugin.connect(randomUser).executeInvestment(0);
            await tx.wait();

            const proposal = await customPlugin.InvestmentProposals(0);
            
            expect(proposal.executed).to.equal(true);
        
        });

        

    });

//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28 ;

import {PluginCloneable, IDAO} from "@aragon/osx-commons-contracts/src/plugin/PluginCloneable.sol";  //δινει βαση για το aragon & βασικο για το auth()
import {IMajorityVoting} from "./interfaces/aragon/IMajorityVoting.sol"; //den iparxei se npm package ara to exoume kanei 100% download mesa sto diko mas 
import {IExecutor , Action} from "@aragon/osx-commons-contracts/src/executors/IExecutor.sol";


interface Tokenvoting{                    //Δηλωση του υπαρχων contract token voting για να μπορω να το χρησιμοποιω
    function createProposal(          
        bytes calldata _metadata,
        Action[] calldata _actions,
        uint256 _allowFailureMap,
        uint64 _startDate,
        uint64 _endDate,
        IMajorityVoting.VoteOption _voteOption,
        bool _tryEarlyExecution 
    ) external returns (uint256 proposalid);

    function dao() external view returns (IDAO);
    function canExecute(uint256 _proposalId) external view returns (bool);
    function execute(uint256 _proposalId) external;
    function CREATE_PROPOSAL_PERMISSION_ID() external view returns (bytes32);
}


contract CustomPlugin is PluginCloneable {   //εναρξη του custom plugin & κληρονομικοτητα απο Pugin του Aragon  //UPDATE : cloneable για να μπορουμε να εχουμε πολλα Instances 

bytes32 public constant UPDATE_CONFING_PERMISSION_ID = keccak256("UPDATE_CONFING_PERMISSION_ID");    //εδω οριζω τα permission id's ,δηλαδη
bytes32 public constant ORACLE_PERMISSION_ID = keccak256("ORACLE_PERMISSION_ID");                    //μονο οποιος εχει το permission θα 
bytes32 public constant CREATE_PROPOSAL_PERMISSION_ID= keccak256("CREATE_PROPOSAL_PERMISSION_ID");   //μπορει να κανει το αναλογο act
//bytes32 public constant EXECUTE_INVESTMENT_PERMISSION_ID = keccak256("EXECUTE_INVESTMENT_PERMISSION_ID");


address public oracle;              //ορισμος address για oracle & για contract
Tokenvoting public tokenforvoting;

uint256 public maxAllowedRiskScore = 100 ;   //ορισμος μεγιστου ρισκου και χρονικης διαρκειας
uint256 public maxRiskDataAge = 1 days ;


struct RiskData {             //δημιουργια struct για τα δεδομενα σχετικα με το ρισκο , παιρνει το τελευταιο αποτελεσμα απο Mpc 
    uint256 RiskScore;
    uint256 timestamp;
    bytes32 datahash;
}

RiskData public LatestRiskData;  //εδω αποθηκευουμε το πιο προσφατο risk data απο mpc











//  constructor(      //ο constructor τρεχει μολις γινει deploy , δινει το address του dao aragon _dao 
//       IDAO _dao,
//       address _tokenVoting
//      )Plugin(_dao){     //εδω καλειτε ο parent constructor για να ξερει που ανηκει
//      tokenforvoting = Tokenvoting(_tokenVoting); //δινεις το address και λες οτι αυτο το address ειναι του tokenvoting 
//          }




function initialize(      //γινεται η αρχικοποιηση των υπαρχοντων μεταβλητων μεσα στο function το οποιο θα ορισει για το cloneable plugin τις μεταβλητες
    IDAO _dao,                                                                                          //τα οριζει στο πλαισιο του instance οχι σαν μεταβλητη , αυτο γινεται πιο πανω 
    address _tokenVoting,                                                                              //γεμιζει με αρχικες τιμες για το συγκεκριμενο instance
    address _oracle,
    uint256 _maxAllowedRiskScore,
    uint256 _maxRiskDataAge 
) external initializer {                    //εδω δηλωνεται οτι θα γινει κληση απο external source , Που ειναι το set up contract και το initilizer Οριζει οτι μπορει να κληθει μονο μια φορα. 
    __PluginCloneable_init(_dao);          //κληρονομει dao()  getter απο cloneable ωστε να επιστρεφει σωστα ποιο dao εχει αυτο το instance. 
    oracle=_oracle;
    tokenforvoting = Tokenvoting(_tokenVoting);
    require(tokenforvoting.dao()  ==  _dao , "Not the correct DAO");
    maxAllowedRiskScore = _maxAllowedRiskScore;
    maxRiskDataAge = _maxRiskDataAge;
}

function submitRiskData(   //το function αυτο επιτρεπει στο oracle να ανεβασει τα δεδομενα ρισκου
    uint256 _RiskScore,
    bytes32 _datahash
)
external 
auth(ORACLE_PERMISSION_ID){                                                         //permission για το oracle
    require(_RiskScore < maxAllowedRiskScore , "Invalid risk score , too high !");
    
    LatestRiskData = RiskData({          //εδω γινεται η αποθηκευση των δεδομενων ρισκου
        RiskScore : _RiskScore,
        timestamp : block.timestamp,
        datahash  : _datahash
    });
    
    }












uint256 public proposalcount;  //οριζουμαι εσωτερικο id γιατι το id που επιστρεφει tokenvoting ειναι διαφορετικο , ειναι το id Που ανηκει στο DAO

struct InvestmentProposal{
    uint256 id;
    address creator ;
    address target;
    uint256 amount;
    string description; 
    uint256 riskScore;
    uint256 created_timestamp;
    bool executed;
    uint256 externalProposalId;
}

mapping(uint256 => InvestmentProposal) public InvestmentProposals;  //ειναι αντιστοιχο του array στην solidity


function createInvestmentProposal(   //αυτο ειναι το βασικο function , δημιουργει το proposal αν τυρει τα proposal permissions
    address _target,
    uint256 _amount,
    bytes calldata _callData,
    bytes calldata _metadata,
    string calldata _description
    

)
external 
auth(CREATE_PROPOSAL_PERMISSION_ID)
returns (uint256 proposalid){

    require(_target != address(0) ,
     "Invalid target !");
    
    require(_amount > 0 , 
    "amount must be grater than 0 ");
    
    require(LatestRiskData.timestamp !=0 ,
    "No risk data");
    
    require(LatestRiskData.RiskScore < maxAllowedRiskScore , 
    "risk is too high!"); //add a threshold in the future.
    
    require(LatestRiskData.timestamp + maxRiskDataAge >= block.timestamp ,
     "Risk data is too old");
   
   
    Action[] memory actions = new Action[](1);  //Δημιουργειτε πινακας με ενα DAO action 
    
    
    actions[0] = Action({    // εδω λεμε στο DAO αν περασει το proposal να κανει call αυτα που ακολουθουν. 
        to : _target,
        value : _amount,
        data : _callData
    });
    
    

    uint256 internalProposalid = proposalcount++;


      InvestmentProposals[internalProposalid] = InvestmentProposal({  //αποθηκευση του proposal στο Plugin 
            id : internalProposalid, 
            creator : msg.sender,
            target : _target,
            amount : _amount,
            description : _description,
            riskScore : LatestRiskData.RiskScore,
            created_timestamp : block.timestamp,
            executed : false,
            externalProposalId : 0
    });


    uint256 proposalIDAV = tokenforvoting.createProposal( //εδω στελνουμε το proposal στο voting plugin
        _metadata,
        actions,
        0,
        uint64(block.timestamp),
        uint64(block.timestamp + 3 days),
        IMajorityVoting.VoteOption.None, 
        false
        );


    InvestmentProposals[internalProposalid].externalProposalId = proposalIDAV ;

  

    return (proposalIDAV);


}

function executeInvestment(uint256 _internalProposalid) external {
    require(InvestmentProposals[_internalProposalid].externalProposalId  != 0 , "there is no such proposal");
    require(InvestmentProposals[_internalProposalid].executed == false , "the proposal is allready executed ");
    
    require(tokenforvoting.canExecute(
        InvestmentProposals[_internalProposalid].externalProposalId) == true , "You cant execute this proposal");

InvestmentProposals[_internalProposalid].executed = true ;

tokenforvoting.execute(InvestmentProposals[_internalProposalid].externalProposalId);

}



}
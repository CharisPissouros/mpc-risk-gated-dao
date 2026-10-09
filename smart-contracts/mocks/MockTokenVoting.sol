// SPDX-Licence-Identifier : MIT 
pragma solidity ^0.8.28 ;

import {IMajorityVoting} from "../interfaces/aragon/IMajorityVoting.sol"; 
import {IExecutor , Action} from "@aragon/osx-commons-contracts/src/executors/IExecutor.sol";


contract MockTokenVoting{
    address public dao;
    uint256 public nextProposalId = 1;

    constructor (address _dao){
        dao = _dao;
    }


function createProposal (
        bytes calldata _metadata,
        Action[] calldata _actions,
        uint256 _allowFailureMap,
        uint64 _startDate,
        uint64 _endDate,
        IMajorityVoting.VoteOption _voteOption,
        bool _tryEarlyExecution 


) external returns(uint256 proposalid){

proposalid = nextProposalId;
nextProposalId++;

return proposalid;
}


bool public canbeExecuted = true;

function setCanExecute(bool _value) external {
    canbeExecuted = _value;
}

function canExecute(uint256 _proposalid)external view  returns(bool ){
    return canbeExecuted ;
}


function execute(uint256 _proposalid) external {}

} 
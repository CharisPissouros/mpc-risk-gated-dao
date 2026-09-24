//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28 ;

import {IDAO} from "@aragon/osx-commons-contracts/src/dao/IDAO.sol";
import {PluginSetup, IPluginSetup} from '@aragon/osx-commons-contracts/src/plugin/setup/PluginSetup.sol'; //parent , κληρονομει το plugin set up 
import {PermissionLib} from "@aragon/osx-commons-contracts/src/permission/PermissionLib.sol"; // Permission handle 
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol"; //library so can create instances
import {CustomPlugin} from './CustomPlugin.sol';
import {Tokenvoting} from './CustomPlugin.sol';

contract CustomPluginSetup is PluginSetup {
    
     using Clones for address ; //για καθε address θα χρησιμοποιοω το function clone()
   
    constructor ()PluginSetup(address(new CustomPlugin())){}

    function prepareInstallation(
        address _dao , bytes calldata _data)external override   // καλει το Dao για τα δεοδμενα που ειναι stantard του aragon και external γιατι γινεται κληση απο εξωτερικο contract
        returns(
            address plugin,
            PreparedSetupData memory preparedSetupData
        )
    {
        ( address oracle,                               //εδω υπαρχει το εξης θεμα του encode που θα γινει και πως;
          address tokenVoting,
          uint256 maxAllowedRiskScore,
          uint256 maxRiskDataAge
        ) = abi.decode(_data , (address , address , uint256 , uint256)); // "ξεπακεταρει" τα δεδομενα 
                                                                 
        plugin = IMPLEMENTATION.clone();

        CustomPlugin(plugin).initialize( //εδω γινεται αρχικοποιηση του instance μετα το decode (λειτουργει σαν constructor)
            IDAO(_dao),
            tokenVoting,
            oracle,
            maxAllowedRiskScore,
            maxRiskDataAge
        );

        

        PermissionLib.MultiTargetPermission[] memory permissions = new PermissionLib.MultiTargetPermission[](3);

        permissions[0] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Grant,
                where : plugin,
                who : oracle,
                condition : PermissionLib.NO_CONDITION,
                permissionId : CustomPlugin(plugin).ORACLE_PERMISSION_ID()
        });


            permissions[1] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Grant,
                where : plugin,
                who : oracle,
                condition : PermissionLib.NO_CONDITION, 
                permissionId : CustomPlugin(plugin).CREATE_PROPOSAL_PERMISSION_ID()
        });


            permissions[2] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Grant, 
                where : tokenVoting,
                who: plugin,
                condition : PermissionLib.NO_CONDITION, 
                permissionId : Tokenvoting(tokenVoting).CREATE_PROPOSAL_PERMISSION_ID()
            });

        preparedSetupData.permissions = permissions;

    } 




    function prepareUninstallation( address , SetupPayload calldata _payload  //το address αν και δεν χρησιμοποιηται το βαζουμε με βαση το aragon manual 
    )external view override returns(                                            //payload ολα οσα αφορουν το plugin για την απεγκατασταση
    PermissionLib.MultiTargetPermission[] memory permissions)       //external καλειται μονο εξωτερικα , view γιατι γινεται μονο αναγνωση και δεν αλλαζει κατι στο blockchain
    {
            address plugin = _payload.plugin;
            address oracle = CustomPlugin(plugin).oracle();
            address tokenVoting = address(CustomPlugin(plugin).tokenforvoting());


            permissions = new PermissionLib.MultiTargetPermission[](3);


              permissions[0] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Revoke,
                where : plugin,
                who : oracle,
                condition : PermissionLib.NO_CONDITION,
                permissionId : CustomPlugin(plugin).ORACLE_PERMISSION_ID()
        });


            permissions[1] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Revoke,
                where : plugin,
                who : oracle,
                condition : PermissionLib.NO_CONDITION, 
                permissionId : CustomPlugin(plugin).CREATE_PROPOSAL_PERMISSION_ID()
        });

            permissions[2] = PermissionLib.MultiTargetPermission({
                operation : PermissionLib.Operation.Revoke, 
                where : tokenVoting,
                who: plugin,
                condition : PermissionLib.NO_CONDITION, 
                permissionId : Tokenvoting(tokenVoting).CREATE_PROPOSAL_PERMISSION_ID()
            });





    }
    





}
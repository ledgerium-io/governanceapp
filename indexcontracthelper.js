'use strict';
const Web3 = require('web3');
const indexContractSet = require('./indexcontractset');

class IndexContract {
    
    constructor(){
        this.indexContractSet = new indexContractSet(web3, utils, "", undefined, Web3);
    }

    async setHelperParameters(indexAddress){
        let tranHash = await this.indexContractSet.setOwnersParameters(accountAddressList[0],privateKey[accountAddressList[0]],accountAddressList,indexAddress);
        return tranHash;
    }
    
    async deployNewAdminSetValidatorContractWithPrivateKey(){
        let ethAccountToUse = accountAddressList[0];
        let privateKeyOwner = privateKey[ethAccountToUse];
        var adminValrSetAddress = await this.indexContractSet.deployNewIndexContractContractWithPrivateKey(ethAccountToUse,privateKeyOwner,accountAddressList);
        return adminValrSetAddress;
    }
    
    async runAdminTestCases(){
        console.log("****************** Running Admin Test cases ******************");
        console.log("****************** Start Admin Test cases ******************");
        var adminToAdd = accountAddressList[3];
        var flag = await this.addOneAdminTestCase(adminToAdd);
        console.log("return flag for addOneAdminTestCase ",flag);

        adminToAdd = accountAddressList[4];
        flag = await this.addOneAdminTestCase(adminToAdd);
        console.log("return flag for addOneAdminTestCase ",flag);

        var activeAdminList;
        activeAdminList = await this.getAllActiveAdmins();
        console.log("return list for getAllActiveAdmins",activeAdminList.length);

        var adminToRemove = accountAddressList[3];
        flag = await this.removeOneAdmin(adminToRemove);
        console.log("return flag for removeOneAdmin ",flag);

        activeAdminList = await this.getAllActiveAdmins();
        console.log("return list for getAllActiveAdmins",activeAdminList.length);
        
        console.log("****************** End Admin Test cases ******************");
        return true;
    }

    async runRemoveAdminTestCases(){
        console.log("****************** Running Remove Admin Test cases ******************");
        var activeAdminList = await this.getAllActiveAdmins();
        for(var indexAV = 1; indexAV < activeAdminList.length; indexAV++){
            let removeAdmin = activeAdminList[indexAV];
            let flag = await this.removeOneAdmin(removeAdmin);
            console.log("return flag for removeOneAdmin",flag);
            let activeAdminCurrentList = await this.getAllActiveAdmins();
            console.log("return list for updated getAllActiveAdmins",activeAdminCurrentList.length);
        }
        console.log("****************** End Remove Admin Test cases ******************");
        return true;
    }

    async getAllActiveStakeHolders(){
        var activeStakeHolderList = [];
        try{
            var noOfActiveStakeHolder = 0;
            var stakeHolderList = [];
            stakeHolderList = await this.indexContractSet.getAllStakeHolders(accountAddressList[0]);
            if (stakeHolderList != undefined && stakeHolderList.length > 0) {
                for(var index = 0; index < stakeHolderList.length; index++ ){
                    var flag = await this.indexContractSet.isActiveStakeHolder(accountAddressList[0],stakeHolderList[index]);
                    if(flag){
                        noOfActiveStakeHolder++;
                        activeStakeHolderList.push(stakeHolderList[index]);
                        console.log("StakeHolder[", noOfActiveStakeHolder,"] ",stakeHolderList[index]);
                    }
                }
                console.log("Number of active StakeHolders " + noOfActiveStakeHolder);
            }
        }
        catch (error) {
            console.log("Error in IndexContract:getAllActiveStakeHolders(): " + error);
        }
        return activeStakeHolderList;
    }

    async getAllStakeHolders(){
        var stakeHolderList = [];
        try{
            stakeHolderList = await this.indexContractSet.getAllStakeHolders(accountAddressList[0]);
            if (stakeHolderList != undefined && stakeHolderList.length > 0) {
                for(var index = 0; index < stakeHolderList.length; index++ ){
                    console.log("StakeHolder[", index+1,"] ",stakeHolderList[index]);
                }
            }
            console.log("Number of StakeHolders " + stakeHolderList.length);
        }
        catch (error) {
            console.log("Error in IndexContract:getAllStakeHolders(): " + error);
        }
        return stakeHolderList;
    }
    
    async addOneAdminTestCase(adminToAdd){
        console.log("****************** Running addOneAdminTestCase ******************");
        try{
            var ethAccountToPropose = accountAddressList[0];
            
            var flag = await this.indexContractSet.isActiveAdmin(ethAccountToPropose,adminToAdd);
            console.log(adminToAdd, "got added as admin ?", flag);
            if(flag)
                return true;

            /* Testing the functionality of adding or removing a admin with votes FOR and votes AGAINST.
            * There are 3 admin in the beginning. More than 3/2 votes are needed to make any decision (FOR or AGINST)
            * Sending Proposal means, adding one vote to the proposal
            */
            
            /*We are testing ADD admin functionality here with one proposal FOR adding and one more vote FOR adding,
            * makes more than 3/2 brings this a majority and admin will be added. And proposal will be cleared off!
            * voting AGAINST proposal will add the AGAINST number. FOR/AGAINST vote should get majority to do any final action
            */
            var transactionhash = await this.indexContractSet.proposalToAddAdmin(ethAccountToPropose,adminToAdd,privateKey[ethAccountToPropose]);
            console.log("submitted transactionhash ",transactionhash, "for proposal of adding ", adminToAdd, "by admin", ethAccountToPropose);

            /* Since ADD the admin proposal is raised, checkProposal should return "add"*/
            var whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose,adminToAdd);
            console.log(adminToAdd, "checked proposal for the admin ?", whatProposal);
            
            /* Lets see how voting looks at the moment! It should return 1,0*/
            var votes = await this.indexContractSet.checkVotes(ethAccountToPropose,adminToAdd);
            console.log(adminToAdd, "checked votes for adding as admin ?", votes[0], votes[1]);

            /* Lets see who proposed this admin for adding*/
            var proposer = await this.indexContractSet.getProposer(ethAccountToPropose, adminToAdd);
            console.log(adminToAdd, "checked proposer for the admin ?", proposer);
            
            var activeAdminList = await this.getAllActiveAdmins();
            for(var indexAV = 0; indexAV < activeAdminList.length; indexAV++){
                if(ethAccountToPropose == activeAdminList[indexAV])
                    continue;
                let votingFor = activeAdminList[indexAV];
                /*We are now voting FOR removing admin*/
                transactionhash = await this.indexContractSet.voteForAddingAdmin(votingFor,adminToAdd,privateKey[votingFor]);
                console.log("submitted transactionhash ",transactionhash, "for voting for adding", adminToAdd, "by admin", votingFor);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, adminToAdd);
                console.log(adminToAdd, "checked proposal for the admin ?", whatProposal);
                
                /* Lets see how voting looks at the moment! It should return 1,0*/
                let votes = await this.indexContractSet.checkVotes(ethAccountToPropose,adminToAdd);
                console.log(adminToAdd, "checked votes for removing as admin ?", votes[0], votes[1]);

                indexAV++;
                let votingAgainst = activeAdminList[indexAV];
                if(votingAgainst == undefined)
                    break;
                /* Lets see how voting looks at the moment! It should return 1,1*/
                transactionhash = await this.indexContractSet.voteAgainstAddingAdmin(votingAgainst, adminToAdd, privateKey[votingAgainst]);
                console.log("submitted transactionhash ",transactionhash, "against voting to add ", adminToAdd, "by admin", votingAgainst);
                
                /* Lets see how voting looks at the moment! It should return 1,1*/
                votes = await this.indexContractSet.checkVotes(ethAccountToPropose, adminToAdd);
                console.log(adminToAdd, "checked votes for removing as admin ?", votes[0], votes[1]);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, adminToAdd);
                console.log(adminToAdd, "checked proposal for the admin ?", whatProposal);
                
                //Check if no of required votes (N/2+1) is already achieved, if so, the running proposal will be cleared off
                //if so, dont need to run the loop and break it now, to run further voting!
                if(whatProposal == "proposal not created")
                    break; 
            }
            flag = await this.indexContractSet.isActiveAdmin(ethAccountToPropose,adminToAdd);
            console.log(adminToAdd, "got added as admin ?", flag);

            var activeAdminList;
            activeAdminList = await this.getAllActiveAdmins();
            console.log("return list for getAllActiveAdmins",activeAdminList.length);
            console.log("****************** Ending addOneAdminTestCase ******************");
            return flag;
        }
        catch (error) {
            console.log("Error in IndexContract:addOneAdminTestCase(): " + error);
            return false;
        }
    }

    async addOneStakeHolder(stakeHolderToAdd){
        console.log("****************** Running addOneStakeHolder ******************");
        try{
            var ethAccountToPropose = accountAddressList[0];
            
            var flag = await this.indexContractSet.isActiveStakeHolder(ethAccountToPropose,stakeHolderToAdd);
            console.log(stakeHolderToAdd, "got added as stakeHolder ?", flag);
            if(flag)
                return true;

            /* Testing the functionality of adding or removing a stakeHolder with votes FOR and votes AGAINST.
            * There are 3 stakeHolder in the beginning. More than 3/2 votes are needed to make any decision (FOR or AGINST)
            * Sending Proposal means, adding one vote to the proposal
            */
            
            /*We are testing ADD stakeHolder functionality here with one proposal FOR adding and one more vote FOR adding,
            * makes more than 3/2 brings this a majority and stakeHolder will be added. And proposal will be cleared off!
            * voting AGAINST proposal will add the AGAINST number. FOR/AGAINST vote should get majority to do any final action
            */
            var transactionhash = await this.indexContractSet.proposalToAddStakeHolder(ethAccountToPropose,stakeHolderToAdd,privateKey[ethAccountToPropose]);
            console.log("submitted transactionhash ",transactionhash, "for proposal of adding ", stakeHolderToAdd, "by stakeHolder", ethAccountToPropose);

            /* Since ADD the stakeHolder proposal is raised, checkProposal should return "add"*/
            var methodName = "updateStakeholder-" + stakeHolderToAdd;
            var whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, methodName);
            console.log(stakeHolderToAdd, "checked proposal for the stakeHolder ?", whatProposal);
            
            /* Lets see how voting looks at the moment! It should return 1,0*/
            var votes = await this.indexContractSet.checkVotes(ethAccountToPropose, methodName);
            console.log(stakeHolderToAdd, "checked votes for adding as stakeHolder ?", votes[0], votes[1]);

            /* Lets see who proposed this stakeHolder for adding*/
            var proposer = await this.indexContractSet.getProposer(methodName);
            console.log(stakeHolderToAdd, "checked proposer for the stakeHolder ?", proposer);
            
            var activeStakeHolderList = await this.getAllActiveStakeHolders();
            for(var indexAV = 0; indexAV < activeStakeHolderList.length; indexAV++){
                if(ethAccountToPropose == activeStakeHolderList[indexAV])
                    continue;
                let votingFor = activeStakeHolderList[indexAV];
                /*We are now voting FOR removing stakeHolder*/
                transactionhash = await this.indexContractSet.voteForAddingStakeHolder(votingFor,stakeHolderToAdd,privateKey[votingFor]);
                console.log("submitted transactionhash ",transactionhash, "for voting for adding", stakeHolderToAdd, "by stakeHolder", votingFor);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, methodName);
                console.log(stakeHolderToAdd, "checked proposal for the stakeHolder ?", whatProposal);
                
                /* Lets see how voting looks at the moment! It should return 1,0*/
                let votes = await this.indexContractSet.checkVotes(ethAccountToPropose,methodName);
                console.log(stakeHolderToAdd, "checked votes for removing as stakeHolder ?", votes[0], votes[1]);

                // indexAV++;
                // let votingAgainst = activeStakeHolderList[indexAV];
                // if(votingAgainst == undefined)
                //     break;
                // /* Lets see how voting looks at the moment! It should return 1,1*/
                // transactionhash = await this.indexContractSet.voteAgainstAddingStakeHolder(votingAgainst, stakeHolderToAdd, privateKey[votingAgainst]);
                // console.log("submitted transactionhash ",transactionhash, "against voting to add ", stakeHolderToAdd, "by stakeHolder", votingAgainst);
                
                // /* Lets see how voting looks at the moment! It should return 1,1*/
                // votes = await this.indexContractSet.checkVotes(ethAccountToPropose, stakeHolderToAdd);
                // console.log(stakeHolderToAdd, "checked votes for removing as stakeHolder ?", votes[0], votes[1]);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, stakeHolderToAdd);
                console.log(stakeHolderToAdd, "checked proposal for the stakeHolder ?", whatProposal);
                
                //Check if no of required votes (N/2+1) is already achieved, if so, the running proposal will be cleared off
                //if so, dont need to run the loop and break it now, to run further voting!
                if(whatProposal == "proposal not created")
                    break; 
            }
            flag = await this.indexContractSet.isActiveStakeHolder(ethAccountToPropose,stakeHolderToAdd);
            console.log(stakeHolderToAdd, "got added as stakeHolder ?", flag);

            var activeStakeHolderList;
            activeStakeHolderList = await this.getAllActiveStakeHolders();
            console.log("return list for getAllActiveStakeHolders",activeStakeHolderList.length);
            console.log("****************** Ending addOneStakeHolder ******************");
            return flag;
        }
        catch (error) {
            console.log("Error in IndexContract:addOneStakeHolder(): " + error);
            return false;
        }
    }

    async removeOneStakeHolder(stakeHolderToRemove){
        console.log("****************** Running removeOneStakeHolder ******************");
        try{
            var ethAccountToPropose = accountAddressList[0];
            
            /* Testing the functionality of adding or removing a stakeHolder with votes FOR and votes AGAINST.
            * There are 3 stakeHolder in the beginning. More than 3/2 votes are needed to make any decision (FOR or AGINST)
            * Sending Proposal means, adding one vote to the proposal
            */
            /* Lets see whether this is stakeHolder or not already, if not, we can ignore else will proceed further*/
            var flag = await this.indexContractSet.isActiveStakeHolder(ethAccountToPropose,adminToRemove);
            console.log(adminToRemove, "already an stakeHolder ?", flag);
            if(!flag) 
                return true;

            /*We are testing REMOVE stakeHolder functionality here with one proposal FOR removing and one more vote FOR removing,
            * makes more than 3/2 brings this a majority and stakeHolder will be removed. And proposal will be cleared off!
            * voting AGAINST proposal will add the AGAINST number. FOR/AGAINST vote should get majority to do any final action
            */
            var transactionhash = await this.indexContractSet.proposalToRemoveStakeHolder(ethAccountToPropose,adminToRemove,privateKey[ethAccountToPropose]);
            console.log("submitted transactionhash ",transactionhash, "for proposal of removing ", adminToRemove, "by stakeHolder", ethAccountToPropose);

            /* Since REMOVE the stakeHolder proposal is raised, checkProposal should return "remove"*/
            var whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose,adminToRemove);
            console.log(adminToRemove, "checked proposal for the stakeHolder ?", whatProposal);
            
            /* Lets see how voting looks at the moment! It should return 1,0*/
            var votes = await this.indexContractSet.checkVotes(ethAccountToPropose,adminToRemove);
            console.log(adminToRemove, "checked votes for removing as stakeHolder ?", votes[0], votes[1]);

            /* Lets see who proposed this stakeHolder for removing*/
            var proposer = await this.indexContractSet.getProposer(ethAccountToPropose, adminToRemove);
            console.log(adminToRemove, "checked proposer for the stakeHolder ?", proposer);
            
            var activeStakeHolderList = await this.getAllActiveStakeHolders();
            for(var indexAV = 0; indexAV < activeStakeHolderList.length; indexAV++){
                if(ethAccountToPropose == activeStakeHolderList[indexAV])
                    continue;
                let votingFor = activeStakeHolderList[indexAV];
                /*We are now voting FOR removing stakeHolder*/
                transactionhash = await this.indexContractSet.voteForRemovingStakeHolder(votingFor,adminToRemove,privateKey[votingFor]);
                console.log("submitted transactionhash ",transactionhash, "for voting for removing", adminToRemove, "by stakeHolder", votingFor);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, adminToRemove);
                console.log(adminToRemove, "checked proposal for the stakeHolder ?", whatProposal);
                
                /* Lets see how voting looks at the moment! It should return 1,0*/
                let votes = await this.indexContractSet.checkVotes(ethAccountToPropose,adminToRemove);
                console.log(adminToRemove, "checked votes for removing as stakeHolder ?", votes[0], votes[1]);

                indexAV++;
                let votingAgainst = activeStakeHolderList[indexAV];
                if(votingAgainst == undefined)
                    break;
                /* Lets see how voting looks at the moment! It should return 1,1*/
                transactionhash = await this.indexContractSet.voteAgainstRemovingStakeHolder(votingAgainst, adminToRemove, privateKey[votingAgainst]);
                console.log("submitted transactionhash ",transactionhash, "against voting to remove ", adminToRemove, "by stakeHolder", votingAgainst);
                
                /* Lets see how voting looks at the moment! It should return 1,1*/
                votes = await this.indexContractSet.checkVotes(ethAccountToPropose, adminToRemove);
                console.log(adminToRemove, "checked votes for removing as stakeHolder ?", votes[0], votes[1]);

                whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose, adminToRemove);
                console.log(adminToRemove, "checked proposal for the stakeHolder ?", whatProposal);
                
                //Check if no of required votes (N/2+1) is already achieved, if so, the running proposal will be cleared off
                //if so, dont need to run the loop and break it now, to run further voting!
                if(whatProposal == "proposal not created")
                    break; 
            }
            flag = await this.indexContractSet.isActiveStakeHolder(ethAccountToPropose,adminToRemove);
            console.log(adminToRemove, "still an stakeHolder ?", flag);
            console.log("****************** Ending removeOneStakeHolder ******************");
            return flag;
        }
        catch (error) {
            console.log("Error in IndexContract:removeOneStakeHolder(): " + error);
            return false;
        }
    }

    async runClearProposalsAdminTestCases(otherAdminToCheck){
        console.log("****************** Running Clear Proposal Test cases ******************");
        try{
            let flag = await this.addOneAdminTestCase(otherAdminToCheck);
            console.log("return flag for addOneAdminTestCase ",flag);
            
            var ethAccountToPropose = accountAddressList[0];
            /*We are testing REMOVE admin functionality here with one proposal FOR removing and one more vote FOR removing,
            * makes more than 3/2 brings this a majority and admin will be removed. And proposal will be cleared off!
            * voting AGAINST proposal will add the AGAINST number. FOR/AGAINST vote should get majority to do any final action
            */
            var transactionhash = await this.indexContractSet.proposalToRemoveAdmin(ethAccountToPropose,otherAdminToCheck,privateKey[ethAccountToPropose]);
            console.log("submitted transactionhash ",transactionhash, "for proposal of removing ", otherAdminToCheck, "by admin", ethAccountToPropose);

            /* Since REMOVE the admin proposal is raised, checkProposal should return "remove"*/
            var whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose,otherAdminToCheck);
            console.log(otherAdminToCheck, "checked proposal for the admin ?", whatProposal);
            
            /* Lets see how voting looks at the moment! It should return 1,0*/
            var votes = await this.indexContractSet.checkVotes(ethAccountToPropose,otherAdminToCheck);
            console.log(otherAdminToCheck, "checked votes for removing as admin ?", votes[0], votes[1]);

            /* Lets see who proposed this admin for removing*/
            var proposer = await this.indexContractSet.getProposer(ethAccountToPropose, otherAdminToCheck);
            console.log(otherAdminToCheck, "checked proposer for the admin ?", proposer);

            flag = await this.indexContractSet.clearProposal(ethAccountToPropose,otherAdminToCheck,privateKey[ethAccountToPropose]);
            console.log("return flag for clearing proposal for", otherAdminToCheck,"is", flag);

            /* Since REMOVE the admin proposal is raised, checkProposal should return "remove"*/
            whatProposal = await this.indexContractSet.checkProposal(ethAccountToPropose,otherAdminToCheck);
            console.log(otherAdminToCheck, "checked proposal for the admin ?", whatProposal);
            
            /* Lets see how voting looks at the moment! It should return 1,0*/
            votes = await this.indexContractSet.checkVotes(ethAccountToPropose,otherAdminToCheck);
            console.log(otherAdminToCheck, "checked votes for removing as admin ?", votes[0], votes[1]);

            /* Lets see who proposed this admin for removing*/
            proposer = await this.indexContractSet.getProposer(ethAccountToPropose, otherAdminToCheck);
            console.log(otherAdminToCheck, "checked proposer for the admin ?", proposer);
            return true;
        }
        catch (error) {
            console.log("Error in IndexContract:runClearProposalsAdminTestCases(): " + error);
            return false;
        }    
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = IndexContract;
}else{
    window.IndexContract = IndexContract;
}
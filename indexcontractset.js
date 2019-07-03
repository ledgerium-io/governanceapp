class IndexContractSet {

    constructor(web3provider, utils, indexAddress, abi, Web3) { 
        var value;
        this.utils = utils;
        if(!abi) {
            //Read ABI and Bytecode from dynamic source.
            value = this.utils.readSolidityContractJSON("./build/contracts/LedgeriumIndexContract",false);
        }else{
            value = [abi, ""];
        }
        if(value.length > 0){
            this.web3 = new Web3(web3provider);
            this.indexContractSetAbi = value[0];
            this.indexContractSetByteCode = value[1];
            this.indexAddress = indexAddress;
            this.contract = new this.web3.eth.Contract(JSON.parse(this.indexContractSetAbi),indexAddress);
        }
    }
    
    async setOwnersParameters(ethAccountToUse,_privateKey,stakeHoldersList,indexAddress) {
        try{
            this.indexAddress = indexAddress;
            this.contract = new this.web3.eth.Contract(JSON.parse(this.indexContractSetAbi),this.indexAddress);
            
            if(webSocketProtocolFlag){
                if(subscribePastEventsFlag)
                    this.listenContractPastEvents();
                this.listenContractAllEvents(this.contract);  
            }
            let transactionHash = await this.init(ethAccountToUse,_privateKey,stakeHoldersList);
            return transactionHash;
        }
        catch (error) {
            console.log("Error in IndexContractSet.setOwnersParameters(): " + error);
            return "";
        }    
    }

    async init(ethAccountToUse,_privateKey,stakeHoldersList) {
        try{
            if (stakeHoldersList.length < 3)
                return "";
            //Solidity does not take dynakic list of input parameters. So had give it seperate parameters. We have deided to give 4 validators as admin for Ledgerium Blockchain
            var encodedABI = this.contract.methods.init(stakeHoldersList[0],stakeHoldersList[1],stakeHoldersList[2]).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,_privateKey,this.web3,estimatedGas);

            var logs = await this.contract.getPastEvents('InitStakeHolderAdded',{fromBlock: 0, toBlock: 'latest'});
            console.log('InitStakeHolderAdded event logs ' + JSON.stringify(logs));

            logs = await this.contract.getPastEvents('TotalNoOfStakeHolders',{fromBlock: 0, toBlock: 'latest'});
            console.log('TotalNoOfStakeHolders event logs ' + JSON.stringify(logs))
            
            if(transactionObject && transactionObject.transactionHash)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:init(): " + error);
            return "";
        }
    }
    
    async getAllStakeHolders2() {
        return await this.contract.methods.getAllStakeHolders().call({});
        // var encodedABI = this.contract.methods.getAllStakeHolders().encodeABI();
        // return await web3.eth.call({
        //     data: encodedABI
        // });
    }

    async getAllStakeHolders(ethAccountToUse) {
        var resultList = [];
        try {
            var encodedABI = this.contract.methods.getAllStakeHolders().encodeABI();
            resultList = await this.utils.getData(ethAccountToUse,this.indexAddress,encodedABI,this.web3);
            console.log(resultList);
            return this.utils.split(resultList);
        } catch (error) {
            console.log("Error in IndexContractSet:getAllStakeHolders(): " + error);
            return resultList;
        }
    }
    
    async proposalToAddStakeHolder(ethAccountToUse, otherStakeHolderToAdd, privateKey) {
        try{
            var encodedABI = this.contract.methods.createStakeHolderUpdate(otherStakeHolderToAdd, true).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            // var logs = await this.contract.getPastEvents('InitStakeHolderAdded',{fromBlock: 0, toBlock: 'latest'});
            // console.log('InitStakeHolderAdded event logs ' + JSON.stringify(logs));

            // logs = await this.contract.getPastEvents('TotalNoOfStakeHolders',{fromBlock: 0, toBlock: 'latest'});
            // console.log('TotalNoOfStakeHolders event logs ' + JSON.stringify(logs))
            
            if(transactionObject) {
                return transactionObject.transactionHash;
            }    
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:proposalToAddStakeHolder(): " + error);
            return "";
        }
    }

    async voteForAddingStakeHolder(ethAccountToUse, otherStakeHolderToAdd, privateKey) {
        try{
            var encodedABI = this.contract.methods.voteStakeHolder(otherStakeHolderToAdd, true).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:voteForAddingStakeHolder(): " + error);
            return "";
        }
    }

    async voteAgainstAddingStakeHolder(ethAccountToUse, otherStakeHolderToAdd, privateKey) {
        try{
            var encodedABI = this.contract.methods.voteStakeHolder(otherStakeHolderToAdd, false).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:voteAgainstAddingStakeHolder(): " + error);
            return "";
        }
    }
    
    async proposalToRemoveStakeHolder(ethAccountToUse, otherStakeHolderToRemove, privateKey) {
        try{
            var encodedABI = this.contract.methods.createStakeHolderUpdate(otherStakeHolderToRemove, false).encodeABI();
            //var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            //console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:proposalToRemoveStakeHolder(): " + error);
            return "";
        }
    }

    async voteForRemovingStakeHolder(ethAccountToUse, otherStakeHolderToRemove, privateKey) {
        try{
            var encodedABI = this.contract.methods.voteStakeHolder(otherStakeHolderToRemove, false).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:voteForRemovingStakeHolder(): " + error);
            return "";
        }
    }
    
    async voteAgainstRemovingStakeHolder(ethAccountToUse, otherStakeHolderToRemove, privateKey) {
        try{
            var encodedABI = this.contract.methods.voteStakeHolder(otherStakeHolderToRemove, false).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:voteAgainstRemovingStakeHolder(): " + error);
            return "";
        }
    }
    
    async isActiveStakeHolder(ethAccountToUse, otherStakeHolderToCheck) {
        try {
            var flag = await this.contract.methods.isActiveStakeHolder(otherStakeHolderToCheck).call({from : ethAccountToUse});
            return flag;
        } catch (error) {
            console.log("Error in IndexContractSet:isActiveStakeHolder(): " + error);
            return false;
        }
    }

    async checkVotes(ethAccountToUse, methodName) {
        try {
            var votes = await this.contract.methods.getVoted(methodName).call({from : ethAccountToUse});
            return votes;
        } catch (error) {
            console.log("Error in IndexContractSet:checkVotes(): " + error);
            return false;
        }
    }

    async checkProposal(ethAccountToUse, methodName) {
        try {
            var whatProposal = await this.contract.methods.isVotingActive(methodName).call({from : ethAccountToUse});
            return whatProposal;
        } catch (error) {
            console.log("Error in IndexContractSet:checkProposal(): " + error);
            return "false";
        }
    }
    
    async clearProposal(ethAccountToUse, otherStakeHolderToCheck, privateKey) {
        try{
            var encodedABI = this.contract.methods.clearProposal(otherStakeHolderToCheck).encodeABI();
            // var estimatedGas = await this.utils.estimateGasTransaction(ethAccountToUse,this.contract._address, encodedABI,this.web3);
            // console.log("estimatedGas",estimatedGas);
            var estimatedGas = 0;
            var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.contract._address,encodedABI,privateKey,this.web3,estimatedGas);
            if(transactionObject)
                return transactionObject.transactionHash;
            else
                return "";
        }
        catch (error) {
            console.log("Error in IndexContractSet:clearProposal(): " + error);
            return false;
        }
    }
    
    async getProposer(ethAccountToUse, otherStakeHolderToCheck) {
        try {
            var data = await this.contract.methods.getProposer(otherStakeHolderToCheck).call({from : ethAccountToUse});
            return data;
        } catch (error) {
            console.log("Error in IndexContractSet:getProposer(): " + error);
            return false;
        }
    }

    listenContractPastEvents() {
        this.contract.getPastEvents('AddStakeHolder',{fromBlock: 0, toBlock: 'latest'/*,filter: {_admin: "0xf1cba7514dcf9d1e8b1151bcfa05db467c0dcf1a"}*/},
            (error, events) => {
                if(!error && events.length > 0){
                    events.forEach(eachElement => {
                        if(eachElement.event == "AddStakeHolder") {
                            console.log("listenContractPastEvents for AddStakeHolder Event");
                            console.log("AddStakeHolder:Contract address",eachElement.address);
                            console.log("AddStakeHolder:Transaction Hash",eachElement.transactionHash);
                            console.log("AddStakeHolder:Block Hash",eachElement.blockHash);
                            console.log("AddStakeHolder:proposer",eachElement.returnValues[0]);
                            console.log("AddStakeHolder:admin",eachElement.returnValues[1]);
                        }
                    })
                }
                else
                    console.log("Error in processing IndexContractSet:AddStakeHolder event: " + error);
            });
     }     
        
     listenContractAllEvents(contractObject) {
        this.utils.listenContractAllEvents(contractObject, (events)=> {
            console.log('IndexContractSet live event Received');
            switch(events.event) {
                case "VotedForAdd":
                    console.log("VotedForAdd:Contract address",events.address);
                    console.log("VotedForAdd:Voting admin ",events.returnValues.admin);
                    console.log("VotedForAdd:admin",events.returnValues.voted);
                    break;
                case "VotedForRemove":
                    console.log("VotedForRemove:Contract address",events.address);
                    console.log("VotedForRemove:Voting admin ",events.returnValues.admin);
                    console.log("VotedForRemove:admin",events.returnValues.voted);
                    break;
                case "VotedAgainstAdd":
                    console.log("VotedAgainstAdd:Contract address",events.address);
                    console.log("VotedAgainstAdd:Voting admin ",events.returnValues.admin);
                    console.log("VotedAgainstAdd:admin",events.returnValues.voted);
                    break;
                case "VotedAgainstRemove":
                    console.log("VotedAgainstRemove:Contract address",events.address);
                    console.log("VotedAgainstRemove:Voting admin ",events.returnValues.admin);
                    console.log("VotedAgainstRemove:admi    n",events.returnValues.voted);
                    break;
                case "AddStakeHolder":
                    console.log("AddStakeHolder:Contract address",events.address);
                    console.log("AddStakeHolder:proposer ",events.returnValues.proposer);
                    console.log("AddStakeHolder:admin",events.returnValues.admin);
                    break;
                case "RemoveStakeHolder":
                    console.log("RemoveStakeHolder:Contract address",events.address);
                    console.log("RemoveStakeHolder:proposer ",events.returnValues.proposer);
                    console.log("RemoveStakeHolder:admin",events.returnValues.admin);
                    break;
                case "AlreadyProposalForAddingStakeHolder":
                    console.log("AlreadyProposalForAddingStakeHolder:Contract address",events.address);
                    console.log("AlreadyProposalForAddingStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "AlreadyProposalForRemovingStakeHolder":
                    console.log("AlreadyProposalForRemovingStakeHolder:Contract address",events.address);
                    console.log("AlreadyProposalForRemovingStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "NoProposalForAddingStakeHolder":
                    console.log("NoProposalForAddingStakeHolder:Contract address",events.address);
                    console.log("NoProposalForAddingStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "NoProposalForRemovingStakeHolder":
                    console.log("NoProposalForRemovingStakeHolder:Contract address",events.address);
                    console.log("NoProposalForRemovingStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "AlreadyActiveStakeHolder":
                    console.log("AlreadyActiveStakeHolder:Contract address",events.address);
                    console.log("AlreadyActiveStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "AlreadyInActiveStakeHolder":
                    console.log("AlreadyInActiveStakeHolder:Contract address",events.address);
                    console.log("AlreadyInActiveStakeHolder:StakeHolder",events.returnValues._address);
                    break;
                case "MinStakeHolderNeeded":
                    console.log("MinStakeHolderNeeded:Contract address",events.address);
                    console.log("MinStakeHolderNeeded:min no of admins needed",events.returnValues.minNoOfStakeHolder);
                    break;
                case "alreadyProposalForAddingStakeHolder":
                    console.log("alreadyProposalForAddingStakeHolder");
                    break;
                case "alreadyProposalForRemovingStakeHolder":
                    console.log("alreadyProposalForRemovingStakeHolder");
                    break;
                case "noProposalForAddingStakeHolder":
                    console.log("noProposalForAddingStakeHolder");
                    break;
                case "noProposalForRemovingStakeHolder":
                    console.log("noProposalForRemovingStakeHolder");
                    break;
                case "alreadyActiveStakeHolder":
                    console.log("alreadyActiveStakeHolder");
                    break;
                case "alreadyInActiveStakeHolder":
                    console.log("alreadyInActiveStakeHolder");
                    break;
                default:			
                    break;
            }
        });
    }  
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    const Web3 = require('web3');
    module.exports = IndexContractSet;
}else{
    window.IndexContractSet = IndexContractSet;
}
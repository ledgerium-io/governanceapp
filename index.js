'use strict';
const fs = require('fs');
const Web3 = require('web3');
const Utils =  require('./web3util');
const SimpleValidator = require('./simplevalidatorindex');
const AdminValidator = require('./adminvalidatorindex');
const ethUtil = require('ethereumjs-util');

var provider;
var protocol,host,port,web3;

global.web3 = web3;

var subscribePastEventsFlag = false;
var webSocketProtocolFlag = false;
global.webSocketProtocolFlag = webSocketProtocolFlag;
global.subscribePastEventsFlag = subscribePastEventsFlag;

const utils = new Utils();
global.utils = utils;

//var usecontractconfig = false;
//var readkeyconfig = false;
var contractsList = {};
//Helper object for SimpleValidator Contract and AdminValdiator Contract! For now, globally declared
var adminValidator,simpleValidator;

var privateKey = {};
var accountAddressList = [];
var adminValidatorSetAddress = "", simpleValidatorSetAddress = "", networkManagerAddress = "";

var main = async function () {
    const args = process.argv.slice(2);
    for (let i=0; i<args.length ; i++) {
        let temp = args[i].split("=");
        switch (temp[0]) {
            case "protocol":
                switch (temp[1]) {
                    case "ws":
                        protocol = "ws://";
                        global.protocol = protocol;
                        webSocketProtocolFlag = true;
                        global.webSocketProtocolFlag = webSocketProtocolFlag;
                        break;
                    case "http":
                    default:
                        protocol = "http://";
                        global.protocol = protocol;
                        webSocketProtocolFlag = false;
                        global.webSocketProtocolFlag = webSocketProtocolFlag;
                        break;
                }
                break;
            case "hostname":{
                    host = temp[1];
                    global.host = host;
                }
                break;
            case "port":{
                    port = temp[1];
                    global.port = port;
                    let URL = protocol + host + ":" + port;
                    switch(protocol){
                        case "ws://":
                        default:
                            web3 = new Web3(new Web3.providers.WebsocketProvider(URL));
                            break;
                        case "http://":
                            web3 = new Web3(new Web3.providers.HttpProvider(URL));
                            break;
                    }
                    global.web3 = web3;
                    adminValidator = new AdminValidator();
                    global.adminValidator = adminValidator;
                    simpleValidator = new SimpleValidator();
                    global.simpleValidator = simpleValidator;
                }
                break;
            // case "subscribePastEvents":{
            //         subscribePastEventsFlag = true;
            //         global.subscribePastEventsFlag = subscribePastEventsFlag;
            //     }
            //     break;
            case "readkeyconfig":
                readAccountsAndKeys();
                readContractsFromConfig();
                //await initiateApp();
                break;
            case "privateKeys":
                let prvKeys = temp[1].split(",");
                createAccountsAndManageKeysFromPrivateKeys(prvKeys);
                break;
            case "initiateApp":
                //readAccountsAndKeys();
                let inputvals = temp[1].split(",");
                let peerNodesFileName = inputvals.pop();
                createAccountsAndManageKeysFromPrivateKeys(inputvals);
                await initiateApp(peerNodesFileName);
                break;
            case "runadminvalidator":{
                //Initiate App before any function gets executed
                let list = temp[1].split(",");
                for (let j=0; j<list.length ; j++) {
                    if(list[j].indexOf("0x") > -1)
                        continue;
                    switch (list[j]) {
                        case "runAdminTestCases":
                            var result = await adminValidator.runAdminTestCases();
                            console.log("result",result);
                            break;
                        case "runRemoveAdminTestCases":
                            var result = await adminValidator.runRemoveAdminTestCases();
                            console.log("result",result);
                            break;
                        case "getAllActiveAdmins":
                            var result = await adminValidator.getAllActiveAdmins();
                            console.log("No of active admins",result.length);
                            break;
                        case "getAllAdmins":
                            var result = await adminValidator.getAllAdmins();
                            console.log("No of admins",result.length);
                            break;
                        case "addOneAdmin":
                            //console.log("%%%%%%%%%%%%%%%%%%%%%% addOneAdmin list %%%%%%%%%%%%%%%%%%%%%%", list);
                            var adminList = list.slice(1,list.length);
                            console.log("adminList ", adminList);
                            console.log("no of admin to add ", adminList.length);
                            for(var index = 0; index < adminList.length; index++) {
                                var result = await adminValidator.addOneAdmin(adminList[index]);
                                result = await adminValidator.getAllActiveAdmins();
                                console.log("No of admins",result.length);
                            }
                            break;
                        case "removeOneAdmin":
                            var adminToRemove = list[++j];
                            console.log("adminToRemove ", adminToRemove);
                            var result = await adminValidator.removeOneAdmin(adminToRemove);
                            result = await adminValidator.getAllActiveAdmins();
                            console.log("No of admins",result.length);
                            break;
                        case "runClearProposalsAdminTestCases":
                            var otherAdminToCheck = list[++j];
                            console.log("otherAdminToCheck ", otherAdminToCheck);
                            var result = await adminValidator.runClearProposalsAdminTestCases(otherAdminToCheck);
                            console.log("result",result);
                            result = await adminValidator.getAllActiveAdmins();
                            console.log("No of admins",result.length);
                            break;
                        default:
                            console.log("Given runadminvalidator option not supported! Provide correct details");
                            break;
                    }
                }
                break;
            }
            case "runsimplevalidator":{
                //Initiate App before any function gets executed
                let list = temp[1].split(",");
                for (let j=0; j<list.length ; j++) {
                    if(list[j].indexOf("0x") > -1)
                        continue;
                    switch (list[j]) {
                        case "validatorSetup":
                            var result = await simpleValidator.validatorSetup();
                            console.log("result",result);
                            break;
                        case "runValidatorTestCases":
                            var result = await simpleValidator.runValidatorTestCases();
                            console.log("result",result);
                            break;
                        case "runRemoveValidatorTestCases":
                            var result = await simpleValidator.runRemoveValidatorTestCases();
                            console.log("result",result);
                            break;
                        case "getListOfActiveValidators":
                            var result = await simpleValidator.getListOfActiveValidators();
                            console.log("No of validators",result.length);
                            break;
                        case "addSimpleSetContractValidatorForAdmin":
                            //console.log("%%%%%%%%%%%%%%%%%%%%%% addSimpleSetContractValidatorForAdmin list %%%%%%%%%%%%%%%%%%%%%%", list);
                            var validatorList = list.slice(1,list.length);
                            console.log("no of validator to add ", validatorList.length);
                            console.log("validatorList ", validatorList);
                            for(var index = 0; index < validatorList.length; index++) {
                                var result = await simpleValidator.addSimpleSetContractValidatorForAdmin(validatorList[index]);
                                result = await simpleValidator.getListOfActiveValidators();
                                console.log("No of validators",result.length);
                            }
                            break;
                        case "removeSimpleSetContractValidatorForAdmin":
                            var validator = list[++j];
                            console.log("validator ", validator);
                            var result = await simpleValidator.removeSimpleSetContractValidatorForAdmin(validator);
                            result = await simpleValidator.getListOfActiveValidators();
                            console.log("No of validators",result.length);
                            break;
                        default:
                            console.log("Given runsimplevalidator option not supported! Provide correct details");
                            break;
                    }
                }
                break;
            }
            default:
                //throw "command should be of form :\n node deploy.js host=<host> file=<file> contracts=<c1>,<c2> dir=<dir>";
                break;
        }
    }
    if(web3 != undefined)
        web3.currentProvider.disconnect();

    if(provider)
        provider.engine.stop();
    return;
}

main();

async function initiateApp(peerNodesFileName) {

    readContractsFromConfig();
    if(simpleValidatorSetAddress == "" || adminValidatorSetAddress == "" || networkManagerAddress == "") {
        if(accountAddressList.length < 3) {
            console.log("Ethereum accounts are not available! Can not proceed further!!");
            return;
        }
        adminValidatorSetAddress = await adminValidator.deployNewAdminSetValidatorContractWithPrivateKey();
        simpleValidatorSetAddress = await simpleValidator.deployNewSimpleSetValidatorContractWithPrivateKey(adminValidatorSetAddress);
        writeContractsINConfig();
    }
    console.log("adminValidatorSetAddress", adminValidatorSetAddress);
    console.log("simpleValidatorSetAddress", simpleValidatorSetAddress);
    console.log("networkManagerAddress", networkManagerAddress);

    global.adminValidatorSetAddress = adminValidatorSetAddress;
    global.simpleValidatorSetAddress = simpleValidatorSetAddress;
    global.networkManagerAddress = networkManagerAddress;

    let tranHash = await adminValidator.setHelperParameters(adminValidatorSetAddress);
    console.log("tranHash of initialisation", tranHash);

    tranHash = await simpleValidator.setHelperParameters(simpleValidatorSetAddress,adminValidatorSetAddress);
    console.log("tranHash of initialisation", tranHash);

    var peerNodejson = JSON.parse(fs.readFileSync(peerNodesFileName, 'utf8'));
    if(peerNodejson == "") {
        return;
    }

    var peerNodes = peerNodejson["nodes"];
    //console.log("peerNodes ", peerNodejson);
    global.peerNodes = peerNodes;
    await setupNetworkManagerContract();
}

async function setupNetworkManagerContract() {

    var ethAccountToUse = accountAddressList[0];

    // Todo: Read ABI from dynamic source.
    var abiFilename = __dirname + "/build/contracts/NetworkManagerContract.abi";
    var json = JSON.parse(fs.readFileSync(abiFilename, 'utf8'));
    if(json == "") {
        return;
    }

    var networkManagerAddress = "0x0000000000000000000000000000000000002023";
    var nmContract = new web3.eth.Contract(json,networkManagerAddress);
    var encodedABI = nmContract.methods.init().encodeABI();
    var transactionObject = await utils.sendMethodTransaction(ethAccountToUse,networkManagerAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
    console.log("TransactionLog for Network Manager init() method -", transactionObject.transactionHash);

    for(var index = 0; index < peerNodes.length; index++) {
        var noOfNodes = await nmContract.methods.getNodesCounter().call();
        let flag = false;
        for(let nodeIndex = 0; nodeIndex < noOfNodes; nodeIndex++) {
            let result = await nmContract.methods.getNodeDetails(nodeIndex).call();
            if(result.enode == peerNodes[index].enodeUrl) {
                flag = true;
                break;
            }
        }
        if(!flag)
        {
            if(!peerNodes[index].nodename) {
                console.log("setupNetworkManagerContract nodename for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].hostname) {
                console.log("setupNetworkManagerContract hostname for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].role) {
                console.log("setupNetworkManagerContract role for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].ipaddress) {
                console.log("setupNetworkManagerContract ipaddress for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].port) {
                console.log("setupNetworkManagerContract port for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].publickey) {
                console.log("setupNetworkManagerContract publickey for index", index, "does not exist");
                return;
            }
            if(!peerNodes[index].enodeUrl) {
                console.log("setupNetworkManagerContract enodeUrl for index", index, "does not exist");
                return;
            }
            console.log("Adding following peer node to Network Manager", "\nnodename", peerNodes[index].nodename, "\nhostname", peerNodes[index].hostname, "\nrole", peerNodes[index].role, "\nipaddress", peerNodes[index].ipaddress, "\nport", peerNodes[index].port.toString(), "\npublickey", peerNodes[index].publickey, "\nenode", peerNodes[index].enodeUrl)
            encodedABI = nmContract.methods.registerNode(peerNodes[index].nodename,
                peerNodes[index].hostname,
                peerNodes[index].role,
                peerNodes[index].ipaddress,
                peerNodes[index].port.toString(),
                peerNodes[index].publickey,
                peerNodes[index].enodeUrl
            ).encodeABI();
            transactionObject = await utils.sendMethodTransaction(ethAccountToUse,networkManagerAddress,encodedABI,privateKey[ethAccountToUse],web3,0);
            console.log("TransactionLog for Network Manager registerNode -", transactionObject.transactionHash);
        }
    }
    return;
}

async function createAccountsAndManageKeysFromPrivateKeys(inputPrivateKeys) {
    accountAddressList.length = 0;
    let pubkey;
    for(var index = 0; index < inputPrivateKeys.length; index++){
        let eachElement = inputPrivateKeys[index];
        try{
            let prvKey = ethUtil.toBuffer("0x" + eachElement);
            pubkey = '0x' + ethUtil.privateToAddress(prvKey).toString('hex');
        }
        catch (error) {
            console.log("Error in index.createAccountsAndManageKeysFromPrivateKeys(): " + error);
            return "";
        }
        accountAddressList.push(pubkey);
        privateKey[pubkey] = eachElement;
    }
    var noOfPrivateKeys = Object.keys(privateKey).length;
    var noOfAccounts = accountAddressList.length;
    if(noOfAccounts > 0 && noOfPrivateKeys > 0 && (noOfAccounts == noOfPrivateKeys)){
        console.log(accountAddressList.length + " ethereum accounts are created using private keys!");
    }
    global.accountAddressList = accountAddressList;
    global.privateKey = privateKey;
    return;
}

async function readAccountsAndKeys(){
    var privateKeyFileName = __dirname + "/keystore/" + "privatekey.json";
    if(fs.existsSync(privateKeyFileName)){
        var keyData = fs.readFileSync(privateKeyFileName,"utf8");
        privateKey = JSON.parse(keyData);
        accountAddressList = Object.keys(privateKey);
        console.log("There are", accountAddressList.length, "ethereum accounts & private keys in the privatekey file");
        global.accountAddressList = accountAddressList;
        global.privateKey = privateKey;
        return true;
    }
    else{
        console.log("privatekey.json file does not exist! The program may not function properly!");
        return false;
    }
}

async function writeAccountsAndKeys(){
    var privateKeyFileName = __dirname + "/keystore/" + "privatekey.json";
    var data = JSON.stringify(privateKey,null, 2);
    fs.writeFileSync(privateKeyFileName,data);
    console.log(accountAddressList.length + " ethereum accounts & private keys are written to the privateKey.json file");
    return false;
}

async function readContractsFromConfig(){
    try{
        var contractFileName = __dirname + "/keystore/" + "contractsConfig.json";
        var keyData = {};
        if(fs.existsSync(contractFileName)){
            keyData = fs.readFileSync(contractFileName,"utf8");
            contractsList = JSON.parse(keyData);
            if(contractsList["adminValidatorSetAddress"] != undefined)
                adminValidatorSetAddress = contractsList["adminValidatorSetAddress"];
            if(contractsList["simpleValidatorSetAddress"] != undefined)
                simpleValidatorSetAddress= contractsList["simpleValidatorSetAddress"];
            if(contractsList["networkManagerAddress"] != undefined)
                networkManagerAddress= contractsList["networkManagerAddress"];
        }
    }
    catch (error) {
        console.log("Error in readContractsFromConfig: " + error);
    }
}

async function writeContractsINConfig(){
    try{
        var contractFileName = __dirname + "/keystore/" + "contractsConfig.json";
        contractsList["adminValidatorSetAddress"] = adminValidatorSetAddress;
        contractsList["simpleValidatorSetAddress"] = simpleValidatorSetAddress;
        contractsList["networkManagerAddress"] = networkManagerAddress;

        var data = JSON.stringify(contractsList,null, 2);
        fs.writeFileSync(contractFileName,data);
    }
    catch (error) {
        console.log("Error in writeContractsINConfig: " + error);
    }
}

var chai = require('chai')
var expect = chai.expect;

chai.use(require('chai-bignumber')())
chai.should();

setTimeout(() => {
    describe('Admin Validator', () => {
        this.web3 = web3;
        this.utils = utils;
        this.adminValidatorSetAddress = adminValidatorSetAddress;
        const ethAccountToUse = accountAddressList[0];
        const adminToRemove = accountAddressList[3];
        before(async () => {
          var abiFileName = __dirname + "/../build/contracts/AdminValidatorSet.abi";
          var value = utils.readSolidityContractJSON(abiFileName);
          var adminValidatorContract = new web3.eth.Contract(JSON.parse(value[0]),adminValidatorSetAddress);
          global.adminValidatorContract = adminValidatorContract;
          this.contract = adminValidatorContract;
        })

        describe('All Active Admins', () => {
            it('returns all active admins', async () => {
              
              var encodedABI = await this.contract.methods.getAllAdmins().encodeABI();
              var resultList = await this.utils.getData(ethAccountToUse, this.adminValidatorSetAddress, encodedABI, this.web3);
              var adminList = this.utils.split(resultList);
              for (var index = 0; index < adminList.length; index++) {
                  console.log('Address ' + index + ' ' + adminList[index])
                  var flag = await this.contract.methods.isActiveAdmin(adminList[index]).call({ from: ethAccountToUse });
                  expect(flag).to.be.true;
              }

            })
        })

        describe('Vote against Add Admin before sending Add Admin Proposal', () => {
          it('returns NoProposalForAddingAdmin event', async () => {
            let adminToAdd = accountAddressList[3];
            var votingAgainst = accountAddressList[2];
            var estimatedGas = 0;
            var encodedABI = this.contract.methods.voteAgainstAddingAdmin(adminToAdd).encodeABI();
            var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
            
            var logs = await this.contract.getPastEvents('NoProposalForAddingAdmin');
            var returnValues = logs[0].returnValues;              
            (returnValues['0'].toLowerCase()).should.be.equal(accountAddressList[3]);
          })
      })

      describe('Vote against Remove Admin before sending Remove Admin Proposal', () => {
          it('returns NoProposalForRemovingAdmin event', async () => {
            let adminToRemove = accountAddressList[3];
            var votingAgainst = accountAddressList[2];
            var estimatedGas = 0;
            var encodedABI = this.contract.methods.voteAgainstRemovingAdmin(adminToRemove).encodeABI();
            var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
            
            var logs = await this.contract.getPastEvents('NoProposalForRemovingAdmin');
            var returnValues = logs[0].returnValues;              
            (returnValues['0'].toLowerCase()).should.be.equal(accountAddressList[3]);
          })
      })

        describe('Add One Admin', () => {
            let adminToAdd = accountAddressList[3];
            it('returns admin is inactive before adding as admin', async () => {
                var flag = await this.contract.methods.isActiveAdmin(adminToAdd).call();
                expect(flag).to.be.false;
            })

            describe('Proposal to Add Admin', () => {
              it('returns proposal not created before add admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('proposal not created');
              })

              it('returns votes as [ 0, 0 ] before add admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                  expect(votes).to.deep.equal(['0', '0']);
              })

              it('returns proposalToAddAdmin transaction as true', async () => {
                  var encodedABI = this.contract.methods.proposalToAddAdmin(adminToAdd).encodeABI();
                  var estimatedGas = 0;
                  var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
                  expect(transactionObject.status).to.be.true;
              })

              it('returns AlreadyProposalForAddingAdmin event', async () => {
                var encodedABI = this.contract.methods.proposalToAddAdmin(adminToAdd).encodeABI();
                var estimatedGas = 0;
                var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
                var logs = await this.contract.getPastEvents('AlreadyProposalForAddingAdmin');
                var returnValues = logs[0].returnValues;

                (returnValues['0'].toLowerCase()).should.be.equal(adminToAdd);
      
              })

              it('returns proposal as add after add admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('add');
              })
          
              it('returns votes as [ 1, 0 ] after add admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                  expect(votes).to.deep.equal(['1', '0']);
              })
            })

            describe('Vote against Add Admin', () => {
                it('returns voteAgainstAddingAdmin transaction status as true', async () => {
                  var votingAgainst = accountAddressList[2];
                  var estimatedGas = 0;
                  var encodedABI = this.contract.methods.voteAgainstAddingAdmin(adminToAdd).encodeABI();
                  var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
                  expect(transactionObject.status).to.be.true;
                })

                it('returns proposal as add after voting against add admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('add');
                })

                it('returns votes as [ 1, 1 ] after voting against add admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                  console.log('Votes ' + votes);
                  expect(votes).to.deep.equal(['1', '1']);
                })
              })

            describe('Voting for Add admin', () => {
                it('returns voting for', async () => {
                    var votingFor = accountAddressList[1];
                    var estimatedGas = 0;
                    var encodedABI = this.contract.methods.voteForAddingAdmin(adminToAdd).encodeABI();
                    var transactionObject = await this.utils.sendMethodTransaction(votingFor,this.adminValidatorSetAddress, encodedABI ,privateKey[votingFor],this.web3,estimatedGas);

                    expect(transactionObject.status).to.be.true;
                })

                it('returns proposal not created after voting for add admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToAdd).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('proposal not created');
                })

                it('returns votes as [ 0, 0 ] after voting for add admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToAdd).call({from : ethAccountToUse});
                  expect(votes).to.deep.equal(['0', '0']);
                })
            })

            describe('After admin is added', () => {
              it('returns admin added', async () => {
                  var flag = await this.contract.methods.isActiveAdmin(adminToAdd).call();
                  expect(flag).to.be.true;
              })

              it('returns admin count', async () => {
                  var count = await this.contract.methods.getAdminsCount().call({from : ethAccountToUse});
                  count.should.be.bignumber.equal(4);
              })

              it('returns active admin count', async () => {
                  var count = await this.contract.methods.getActiveAdminsCount().call({from : ethAccountToUse});
                  count.should.be.bignumber.equal(4);
              })

              it('returns AddAdmin event', async () => {
                var logs = await this.contract.getPastEvents('AddAdmin');
                var returnValues = logs[0].returnValues;

                (returnValues['0'].toLowerCase()).should.be.equal(ethAccountToUse);
                (returnValues['1'].toLowerCase()).should.be.equal(accountAddressList[3]);
              })
            })
        })

        describe('Add Existing Admin Again', () => {
          it('returns AlreadyActiveAdmin event', async () => {
              var adminToAdd = accountAddressList[3];
              var encodedABI = this.contract.methods.proposalToAddAdmin(adminToAdd).encodeABI();
              var estimatedGas = 0;
              var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
              var logs = await this.contract.getPastEvents('AlreadyActiveAdmin');
              var returnValues = logs[0].returnValues;

              (returnValues['0'].toLowerCase()).should.be.equal(adminToAdd);
          })
      })

        describe('Remove Admin', () => {
            //const adminToRemove = accountAddressList[3];
            it('returns admin is active before remove admin', async () => {
              var flag = await this.contract.methods.isActiveAdmin(adminToRemove).call();
              expect(flag).to.be.true;
            })

            describe('Proposal to remove admin', () => {
                it('returns proposal not created before remove admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('proposal not created');
                })

                it('returns votes as [ 0, 0 ] before remove admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
                  expect(votes).to.deep.equal(['0', '0']);
                })

                it('returns proposalToRemoveAdmin transaction status as true', async () => {
                  var encodedABI = this.contract.methods.proposalToRemoveAdmin(adminToRemove).encodeABI();
                  var estimatedGas = 0;
                  var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);

                  expect(transactionObject.status).to.be.true;
                })

                it('returns AlreadyProposalForRemovingAdmin event', async () => {
                  var encodedABI = this.contract.methods.proposalToRemoveAdmin(adminToRemove).encodeABI();
                  var estimatedGas = 0;
                  var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
                  var logs = await this.contract.getPastEvents('AlreadyProposalForRemovingAdmin');
                  var returnValues = logs[0].returnValues;

                  (returnValues['0'].toLowerCase()).should.be.equal(adminToRemove);
        
              })

                it('returns proposal as remove after remove admin proposal', async () => {
                  var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});
                  whatProposal.should.be.equal('remove');
                })

                it('returns votes as [ 1, 0 ] after remove admin proposal', async () => {
                  var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
                  expect(votes).to.deep.equal(['1', '0']);
                })

                describe('Vote against Remove Admin', () => {
                  it('returns voteAgainstRemovingAdmin transaction status as true', async () => {
                      var votingAgainst = accountAddressList[2];
                      var estimatedGas = 0;
                      var encodedABI = this.contract.methods.voteAgainstRemovingAdmin(adminToRemove).encodeABI();
                      var transactionObject = await this.utils.sendMethodTransaction(votingAgainst,this.adminValidatorSetAddress, encodedABI ,privateKey[votingAgainst],this.web3,estimatedGas);
                      expect(transactionObject.status).to.be.true;
                  })

                  it('returns proposal as remove after voting against remove admin proposal', async () => {
                      var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});
                      whatProposal.should.be.equal('remove');
                    })

                  it('returns votes as [ 1, 1 ] after voting against remove admin proposal', async () => {
                    var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
                    expect(votes).to.deep.equal(['1', '1']);
                  })
                })

                describe('Voting for Remove admin', () => {
                  it('returns voting for', async () => {

                      var votingFor = accountAddressList[1];
                      var estimatedGas = 0;
                      var encodedABI = await this.contract.methods.voteForRemovingAdmin(adminToRemove).encodeABI();
                      var transactionObject = await this.utils.sendMethodTransaction(votingFor,this.adminValidatorSetAddress, encodedABI ,privateKey[votingFor],this.web3,estimatedGas);
                      expect(transactionObject.status).to.be.true;

                      votingFor = accountAddressList[3];
                      estimatedGas = 0;
                      encodedABI = await this.contract.methods.voteForRemovingAdmin(adminToRemove).encodeABI();
                      transactionObject = await this.utils.sendMethodTransaction(votingFor,this.adminValidatorSetAddress, encodedABI ,privateKey[votingFor],this.web3,estimatedGas);
                      expect(transactionObject.status).to.be.true;
                    })

                    it('returns proposal not created after voting for remove admin proposal', async () => {
                      var whatProposal = await this.contract.methods.checkProposal(adminToRemove).call({from : ethAccountToUse});
                      console.log('What proposal in remove admin ' + whatProposal)
                      whatProposal.should.be.equal('proposal not created');
                    })

                    it('returns votes as [ 0, 0 ] after voting for remove admin proposal', async () => {
                      var votes = await this.contract.methods.checkVotes(adminToRemove).call({from : ethAccountToUse});
                      console.log('Votes ' + votes);
                      expect(votes).to.deep.equal(['0', '0']);
                    })
                })
            })

            describe('After admin is removed', () => {
              it('returns admin removed', async () => {
                var flag = await this.contract.methods.isActiveAdmin(adminToRemove).call();
                expect(flag).to.be.false;
              })

              it('returns admin count', async () => {
                var count = await this.contract.methods.getAdminsCount().call({from : ethAccountToUse});
                count.should.be.bignumber.equal(4);
              })

              it('returns admin count', async () => {
                var count = await this.contract.methods.getActiveAdminsCount().call({from : ethAccountToUse});
                count.should.be.bignumber.equal(3);
              })

              it('returns RemoveAdmin event', async () => {
                var logs = await this.contract.getPastEvents('RemoveAdmin');
                var returnValues = logs[0].returnValues;
                
                (returnValues['0'].toLowerCase()).should.be.equal(ethAccountToUse);
                (returnValues['1'].toLowerCase()).should.be.equal(accountAddressList[3]);
              })
            })
        })

        describe('Remove Same Admin Again', () => {
          it('returns AlreadyInActiveAdmin event', async () => {
              var adminToRemove = accountAddressList[3];
              var encodedABI = this.contract.methods.proposalToRemoveAdmin(adminToRemove).encodeABI();
              var estimatedGas = 0;
              var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
              var logs = await this.contract.getPastEvents('AlreadyInActiveAdmin');
              var returnValues = logs[0].returnValues;

              (returnValues['0'].toLowerCase()).should.be.equal(adminToRemove);
          })
        })

        describe('Clear Proposal', () => {
          const otherAdmin = accountAddressList[4];
          describe('Check proposal and check votes before clearProposal', () => {
            it('returns proposal not created', async () => {
              var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});
              whatProposal.should.be.equal('proposal not created');
            })

            it('returns votes as [ 0, 0 ]', async () => {
              var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
              expect(votes).to.deep.equal(['0', '0']);
            })
          })

          describe('Add Admin Proposal', () => {
            it('returns add admin proposal', async () => {
              var estimatedGas = 0;
              var encodedABI = this.contract.methods.proposalToAddAdmin(otherAdmin).encodeABI();
              var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
              expect(transactionObject.status).to.be.true;
            })

            it('returns proposal as add after add admin proposal', async () => {
              var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});
              whatProposal.should.be.equal('add');
            })

            it('returns votes as [ 1, 0 ] after add admin proposal', async () => {
              var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
              expect(votes).to.deep.equal(['1', '0']);
            })
          })

          describe('Clear Add Admin Proposal', () => {
            it('returns clear proposal', async () => {
              var estimatedGas = 0;
              var encodedABI = this.contract.methods.clearProposal(otherAdmin).encodeABI();
              var transactionObject = await this.utils.sendMethodTransaction(ethAccountToUse,this.adminValidatorSetAddress,encodedABI,privateKey[ethAccountToUse],this.web3,estimatedGas);
              expect(transactionObject.status).to.be.true;
            })

            it('returns proposal not created after clear proposal', async () => {
              var whatProposal = await this.contract.methods.checkProposal(otherAdmin).call({from : ethAccountToUse});
              whatProposal.should.be.equal('proposal not created');
            })

            it('returns votes as [ 0, 0 ] after clear proposal', async () => {
              var votes = await this.contract.methods.checkVotes(otherAdmin).call({from : ethAccountToUse});
              expect(votes).to.deep.equal(['0', '0']);
            })
          })
        })

        describe('All Active Admins again', () => {
          it('returns 3 active admins and 1 non active admins', async () => {
              var encodedABI = await this.contract.methods.getAllAdmins().encodeABI();
              var resultList = await this.utils.getData(ethAccountToUse, this.adminValidatorSetAddress, encodedABI, this.web3);
              var adminList = this.utils.split(resultList);
              for (var index = 0; index < adminList.length; index++) {
                  console.log('Address ' + index + ' ' + adminList[index]);
                  var flag = await this.contract.methods.isActiveAdmin(adminList[index]).call({ from: ethAccountToUse });
                  if(adminList[index] != adminToRemove){
                    expect(flag).to.be.true;
                  }
                  else{
                    expect(flag).to.be.false;
                  }
              }
          })
      })
    })
    run();
}, 8000)
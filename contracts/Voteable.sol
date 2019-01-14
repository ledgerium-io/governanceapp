pragma solidity ^0.5.1;
import "./SafeMath.sol";
import "./Ownable.sol";

/**
 * @title The Voteable contract maintains the data structures of Decision, Proposal and corresponding votes 
 * to maintain the workflow of the entire voting process
 */
contract Voteable {

	using SafeMath for uint32;

	enum Decision {
		NOT_DECIDED,
		FOR,
		AGAINST
	}

	enum Proposal {
		NOT_CREATED,
		ADD,
		REMOVE
	}

	struct Vote {
		Proposal proposal;
		address proposer;	//Address which started the proposal
		uint32 countFor;
		uint32 countAgainst;
		mapping (address => Decision) vote;
		address[] voted;
	}

	/**
    * @dev check whether msg.sender is the original proposer of the voting process
    */
	modifier isProposer(address _address) {
		require(_address != address(0), "Input address is null!");
		require(votes[_address].proposer == msg.sender, "msg.sender is not the proposer!");
		_; 
	}
	
	mapping (address => Vote) internal votes;

	//List of events
	event VotedForAdd(address indexed admin, address indexed voted);
	event VotedForRemove(address indexed admin, address indexed voted);
	
	event VotedAgainstAdd(address indexed admin, address indexed voted);
	event VotedAgainstRemove(address indexed admin, address indexed voted);
	
	/**
    * @dev Function to add vote for specific address from the voter
	* @param _address address, which is under voting for or against
	* @param _address voter, the voter
    * @return Emits event VotedForAdd in case the vote is to add
	* @return Emits event VotedForRemove in case the vote is to remove
	* @return A success flag
    */
	function voteFor(address _address, address voter) internal returns (bool) {
		require(votes[_address].vote[voter] == Decision.NOT_DECIDED, "Voter has already voted for the given address!");
		uint32 count = votes[_address].countFor.add(1);
		votes[_address].countFor = count;
		votes[_address].vote[voter] = Decision.FOR;
		votes[_address].voted.push(voter);
		if(votes[_address].proposal == Proposal.ADD){
			emit VotedForAdd(voter,_address);
		}
		else if (votes[_address].proposal == Proposal.REMOVE){
			emit VotedForRemove(voter,_address);
		}
		return true;
	}

	/**
    * @dev Function to add vote against specific address from the voter
    * @param _address address, which is under voting for or against
	* @param _address voter, the voter
    * @return Emits event VotedForAdd in case the vote is to add
	* @return Emits event VotedForRemove in case the vote is to remove
	* @return A success flag
    */
	function voteAgainst(address _address, address voter) internal returns (bool) {
		require(votes[_address].vote[voter] == Decision.NOT_DECIDED, "Voter has already voted for the given address!");
		uint32 count = votes[_address].countAgainst.add(1);
		votes[_address].countAgainst = count;
		votes[_address].vote[voter] = Decision.AGAINST;
		votes[_address].voted.push(voter);
		if(votes[_address].proposal == Proposal.ADD){
			emit VotedAgainstAdd(voter,_address);
		}
		else if (votes[_address].proposal == Proposal.REMOVE){
			emit VotedAgainstRemove(voter,_address);
		}
		return true;
	}

	/**
    * @dev Function to clear out votes against specific address
	* @param _address address, which is under voting for or against
    * @return A success flag
    */
	function clearVotes(address _address) internal returns (bool) {
		address[] memory list = votes[_address].voted;
		address[] memory empty;
		votes[_address].countFor = 0;
		votes[_address].countAgainst = 0;
		for (uint i = 0; i < list.length; i++) {
            votes[_address].vote[list[i]] = Decision.NOT_DECIDED;
        }
        votes[_address].proposal = Proposal.NOT_CREATED;
        votes[_address].voted = empty;
		votes[_address].proposer = address(0);
        return true;
	}

	/**
    * @dev Function to change vote by specific address
    * @param _address address, which is under voting for or against
    * @return A success flag
    */
	function internalChangeVote(address _address) internal returns (bool) {
		require(votes[_address].vote[msg.sender] != Decision.NOT_DECIDED, "Voter has already voted for the given address!");
		require(votes[_address].proposal != Proposal.NOT_CREATED, "Proposal is already ON for the given address!");
		uint32 cfor = votes[_address].countFor;
		uint32 cagainst = votes[_address].countAgainst;
		if(votes[_address].vote[msg.sender] == Decision.FOR){
			votes[_address].countFor = cfor.sub(1);
			votes[_address].countAgainst = cagainst.add(1);
			votes[_address].vote[msg.sender] = Decision.AGAINST;
		}
		else{
			votes[_address].countFor = cfor.add(1);
			votes[_address].countAgainst = cagainst.sub(1);
			votes[_address].vote[msg.sender] = Decision.FOR;
		}
		return true;
	}

	/**
    * @dev Function to retrieve current state votes for specific address
    * @param _address address, which is under voting for or against
    * @return the count of 'for' and 'against' votes
    */
	function internalCheckVotes(address _address) internal view returns (uint32[2] memory) {
		uint32[2] memory a;
		a[0] = votes[_address].countFor;
		a[1] = votes[_address].countAgainst;
		return a;
	}

	/**
    * @dev Function to check proposal by specific address
    * @param _address address, which is under voting for or against
    * @return the string for either "add", "remove" or "proposal not created" based on the ongoing proposal for specific address
    */
	function internalCheckProposal(address _address) internal view returns (string memory) {
		if(votes[_address].proposal == Proposal.ADD)
			return "add";
		else if(votes[_address].proposal == Proposal.REMOVE)
			return "remove";
		else
			return "proposal not created";
	}

	/**
    * @dev Function to retrieve the list of voters for specific address
    * @param _address address, which is under voting for or against
    * @return the array of all current voters for specific address
    */
	function internalGetVoted(address _address) internal view returns (address[] memory) {
	    address[] memory arr = votes[_address].voted;
	    return arr;
	}	
}

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
	modifier isFromProposerContract(address _address) {
		require(_address != address(0), "Input address is null!");
		require(msg.sender == controllerContractAddress, "msg.sender is not from the correct contract");
		_; 
	}
	
	mapping (address => Vote) internal votes;
	//List of events
	event VotedForAdd(address indexed admin, address indexed voted);
	event VotedForRemove(address indexed admin, address indexed voted);	
	event VotedAgainstAdd(address indexed admin, address indexed voted);
	event VotedAgainstRemove(address indexed admin, address indexed voted);


	function change

	function get() view isFromProposerContract returns (){

	}
	function set() isFromProposerContract returns (){

	}

	function emitVotedFor() returns(){

	}
	function emitVotedFor() returns(){

	}
	function emitVotedFor() returns(){

	}
	function emitVotedFor() returns(){

	}
		
}
pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './TokenTimelock.sol';
import './MCOPToken.sol';


/// @title MCOPCrowdSale Contract
/// For more information about this token sale, please visit https://mcop.io
/// @author reedhong(http://xiaohong.me)
contract MCOPCrowdSale is Pausable {
    using SafeMath for uint;

    /// Constant fields
    /// mcop total tokens supply
    uint public constant MCOP_TOTAL_SUPPLY = 5000000000 ether;

    // release lock token after time
    uint public constant LOCK_TIME =  180 days;

    uint public constant LOCK_STAKE = 48;   
    uint public constant TEAM_STAKE = 8;    // for team 
    uint public constant BASE_STAKE = 4;     
    uint public constant ORG_STAKE = 15;     
    uint public constant PERSONAL_STAKE = 25;

    // max open sale tokens
    uint public constant STAKE_MULTIPLIER = MCOP_TOTAL_SUPPLY / 100;


    address public lockAddress;
    address public teamAddress;
    address public baseAddress;
    address public orgAddress;
    address public personalAddress;

    MCOPToken public mcopToken; 

    // lock token
    TokenTimelock public tokenTimelock; 

    /*
     * EVENTS
     */
    event LockAddress(address onwer);

    modifier validAddress( address addr ) {
        require(addr != address(0x0));
        require(addr != address(this));
        _;
    }

    function MCOPCrowdSale( 
        address _lockAddress,
        address _teamAddress,
        address _baseAddress,
        address _orgAddress,
        address _personalAddress

        ) public 
        validAddress(_lockAddress) 
        validAddress(_teamAddress) 
        validAddress(_baseAddress) 
        validAddress(_orgAddress) 
        validAddress(_personalAddress) 
        {

        lockAddress = _lockAddress;
        teamAddress = _teamAddress;
        baseAddress = _baseAddress;
        orgAddress = _orgAddress;
        personalAddress = _personalAddress;

        mcopToken = new MCOPToken(this, msg.sender);

        tokenTimelock = new TokenTimelock(mcopToken, lockAddress, now + LOCK_TIME);

        mcopToken.mint(tokenTimelock, LOCK_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(teamAddress, TEAM_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(baseAddress, BASE_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(orgAddress, ORG_STAKE * STAKE_MULTIPLIER);  
        mcopToken.mint(personalAddress, PERSONAL_STAKE * STAKE_MULTIPLIER); 
    
    }
    /**
    /// @notice No tipping! (Hopefully, we can prevent user accidents.)
    */
    function() external payable {
        // no public sale
    }
    // release lock token 
    function releaseLockToken() external {
        tokenTimelock.release();
    }

    // @dev withdraw to owner.
    function withdrawBalance() external {
        uint256 balance = this.balance;
        owner.transfer(balance);
    }
}
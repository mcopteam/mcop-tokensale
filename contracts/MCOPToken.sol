pragma solidity ^0.4.4;

import 'zeppelin-solidity/contracts/token/PausableToken.sol';


/// @title MCOPCrowdSale Contract
/// For more information about this token sale, please visit https://mcop.io
/// @author reedhong(http://xiaohong.me)
contract MCOPToken is PausableToken {
    using SafeMath for uint;

    /// Constant token specific fields
    string public constant name = "MCOPToken";
    string public constant symbol = "MPC";
    uint public constant decimals = 18;

    /// mcop total tokens supply
    uint public maxTotalSupply;

    /// Fields that are only changed in constructor
    /// mcop sale  contract
    address public minter; 

    /// ICO start time
    uint public startTime;
    /// ICO end time
    uint public endTime;

    /*
     * MODIFIERS
     */
    modifier onlyMinter {
        assert(msg.sender == minter);
        _;
    }

    modifier isLaterThan (uint x){
        assert(now > x);
        _;
    }

    modifier maxTokenAmountNotReached (uint amount){
        assert(totalSupply.add(amount) <= maxTotalSupply);
        _;
    }

    modifier validAddress( address addr ) {
        require(addr != address(0x0));
        require(addr != address(this));
        _;
    }

    /**
     * CONSTRUCTOR 
     * 
     * @dev Initialize the MCOP Token
     * @param _minter The MCOPCrowdSale Contract 
     * @param _maxTotalSupply total supply token    
     * @param _startTime ICO start time
     * @param _endTime ICO End Time
     */
    function MCOPToken(address _minter, address _admin, uint _maxTotalSupply, uint _startTime, uint _endTime) 
        public 
        validAddress(_admin)
        validAddress(_minter)
        {
        minter = _minter;
        startTime = _startTime;
        endTime = _endTime;
        maxTotalSupply = _maxTotalSupply;
        transferOwnership(_admin);
    }

    /**
     * EXTERNAL FUNCTION 
     * 
     * @dev MCOPCrowdSale contract instance mint token
     * @param receipent The destination account owned mint tokens    
     * @param amount The amount of mint token
     * be sent to this address.
     */

    function mint(address receipent, uint amount)
        external
        onlyMinter
        maxTokenAmountNotReached(amount)
        returns (bool)
    {
        require(now <= endTime);
        balances[receipent] = balances[receipent].add(amount);
        totalSupply = totalSupply.add(amount);
        return true;
    }
}
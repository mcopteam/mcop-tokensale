pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/PausableToken.sol';


/// @title MCOPCrowdSale Contract
/// For more information about this token sale, please visit https://mcop.io
/// @author reedhong(http://xiaohong.me)
contract MCOPToken is PausableToken {
    using SafeMath for uint;

    /// Constant token specific fields
    string public constant name = "MCOPToken";
    string public constant symbol = "MLB";
    uint public constant decimals = 18;


    /// Fields that are only changed in constructor
    /// mcop sale  contract
    address public minter; 

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
     */
    function MCOPToken(address _minter, address _admin) 
        public 
        validAddress(_minter)
        validAddress(_admin)
    {
        minter = _minter;
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
        returns (bool)
    {
        balances[receipent] = balances[receipent].add(amount);
        totalSupply = totalSupply.add(amount);
        return true;
    }
}
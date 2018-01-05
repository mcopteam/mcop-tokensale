pragma solidity ^0.4.19;

import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';
import './TokenTimelock.sol';
import './MCOPToken.sol';


/// @title MCOPCrowdSale Contract
/// ICO Rules according: https://mcop.io/crowdsale
/// For more information about this token sale, please visit https://mcop.io
/// @author reedhong(http://xiaohong.me)
contract MCOPCrowdSale is Pausable {
    using SafeMath for uint;

    /// Constant fields
    /// mcop total tokens supply
    uint public constant MCOP_TOTAL_SUPPLY = 10000000000 ether;
    uint public constant MAX_SALE_DURATION = 3 weeks;

    // release lock token after time
    uint public constant LOCK_TIME =  5 years;

    /// Exchange rates for first phase
    uint public constant PRICE_RATE_FIRST = 20833;
    /// Exchange rates for second phase
    uint public constant PRICE_RATE_SECOND = 18518;
    /// Exchange rates for last phase
    uint public constant PRICE_RATE_LAST = 16667;


    uint256 public minBuyLimit = 0.1 ether;
    uint256 public maxBuyLimit = 100 ether;

    uint public constant LOCK_STAKE = 800;  
    uint public constant DEV_TEAM_STAKE = 98;     
    uint public constant COMMUNITY_STAKE = 2;     
    uint public constant PRE_SALE_STAKE = 60;      
    uint public constant OPEN_SALE_STAKE = 40;

    
    uint public constant DIVISOR_STAKE = 1000;

    // max open sale tokens
    uint public constant MAX_OPEN_SOLD = MCOP_TOTAL_SUPPLY * OPEN_SALE_STAKE / DIVISOR_STAKE;
    uint public constant STAKE_MULTIPLIER = MCOP_TOTAL_SUPPLY / DIVISOR_STAKE;

    /// All deposited ETH will be instantly forwarded to this address.
    address public wallet;
    address public presaleAddress;
    address public lockAddress;
    address public teamAddress;
    address public communityAddress;
    /// Contribution start time
    uint public startTime;
    /// Contribution end time
    uint public endTime;

    /// Fields that can be changed by functions
    /// Accumulator for open sold tokens
    uint public openSoldTokens;
    /// ERC20 compilant mcop token contact instance
    MCOPToken public mcopToken; 

    // lock token
    TokenTimelock public tokenTimelock; 

    /// tags show address can join in open sale
    mapping (address => uint) public fullWhiteList;

    /*
     * EVENTS
     */
    event NewSale(address indexed destAddress, uint ethCost, uint gotTokens);
    event NewWallet(address onwer, address oldWallet, address newWallet);
    //event CheckWhiteList(address addr, uint flag);
    //event WhiteList(address addr, uint flag);

    modifier notEarlierThan(uint x) {
        require(now >= x);
        _;
    }

    modifier earlierThan(uint x) {
        require(now < x);
        _;
    }

    modifier ceilingNotReached() {
        require(openSoldTokens < MAX_OPEN_SOLD);
        _;
    }  

    modifier isSaleEnded() {
        require(now > endTime || openSoldTokens >= MAX_OPEN_SOLD);
        _;
    }

    modifier validAddress( address addr ) {
        require(addr != address(0x0));
        require(addr != address(this));
        _;
    }

    function MCOPCrowdSale (address _admin, 
        address _wallet, 
        address _presaleAddress,
        address _lockAddress,
        address _teamAddress,
        address _communityAddress,
        uint _startTime 
        ) public 
        validAddress(_admin) 
        validAddress(_wallet) 
        validAddress(_presaleAddress) 
        validAddress(_lockAddress) 
        validAddress(_teamAddress) 
        validAddress(_communityAddress) 
        {

        wallet = _wallet;
        presaleAddress = _presaleAddress;
        lockAddress = _lockAddress;
        teamAddress = _teamAddress;
        communityAddress = _communityAddress;        
        startTime = _startTime;
        endTime = startTime + MAX_SALE_DURATION;

        openSoldTokens = 0;
        /// Create mcop token contract instance
        mcopToken = new MCOPToken(this, _admin, MCOP_TOTAL_SUPPLY, startTime, endTime);

        tokenTimelock = new TokenTimelock(mcopToken, lockAddress, now + LOCK_TIME);

        /// Reserve tokens according mcop ICO rules
        mcopToken.mint(presaleAddress, PRE_SALE_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(tokenTimelock, LOCK_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(teamAddress, DEV_TEAM_STAKE * STAKE_MULTIPLIER);
        mcopToken.mint(communityAddress, COMMUNITY_STAKE * STAKE_MULTIPLIER);  

        transferOwnership(_admin);
    }

    function setMaxBuyLimit(uint256 limit)
        public
        onlyOwner
        earlierThan(endTime)
    {
        maxBuyLimit = limit;
    }

    function setMinBuyLimit(uint256 limit)
        public
        onlyOwner
        earlierThan(endTime)
    {
        minBuyLimit = limit;
    }

    /// @dev batch set quota for user admin
    /// if openTag <=0, removed 
    function setWhiteList(address[] users, uint openTag)
        public
        onlyOwner
        earlierThan(endTime)
    {
        require(saleNotEnd());
        // WhiteList(users[0], openTag);
        for (uint i = 0; i < users.length; i++) {
            //WhiteList(users[i], openTag);
            fullWhiteList[users[i]] = openTag;
        }
    }


    /// @dev batch set quota for early user quota
    /// if openTag <=0, removed 
    function addWhiteList(address user, uint openTag)
        public
        onlyOwner
        earlierThan(endTime)
    {
        require(saleNotEnd());
        //WhiteList(user, openTag);
        fullWhiteList[user] = openTag;

    }

    /// @dev Emergency situation
    function setWallet(address newAddress)  external onlyOwner { 
        NewWallet(owner, wallet, newAddress);
        wallet = newAddress; 
    }

    /// @return true if sale not ended, false otherwise.
    function saleNotEnd() constant internal returns (bool) {
        return now < endTime && openSoldTokens < MAX_OPEN_SOLD;
    }

    /**
     * Fallback function 
     * 
     * @dev If anybody sends Ether directly to this  contract, consider he is getting mcop token
     */
    function () public payable {
      buyMPC(msg.sender);
    }

    /*
     * PUBLIC FUNCTIONS
     */
    /// @dev Exchange msg.value ether to MCOP for account recepient
    /// @param receipient MCOP tokens receiver
    function buyMPC(address receipient) 
        public 
        payable 
        whenNotPaused  
        ceilingNotReached 
        earlierThan(endTime)
        validAddress(receipient)
        returns (bool) 
    {
        require(msg.value >= minBuyLimit);
        require(msg.value <= maxBuyLimit);
        // Do not allow contracts to game the system
        require(!isContract(msg.sender));        

        require(tx.gasprice <= 50000000000 wei);

        uint inWhiteListTag = fullWhiteList[receipient];
        //CheckWhiteList(receipient, inWhiteListTag);
        require(inWhiteListTag>0);
        
        doBuy(receipient);

        return true;
    }


    /// @dev Buy mcop token normally
    function doBuy(address receipient) internal {
        // protect partner quota in stage one
        uint tokenAvailable = MAX_OPEN_SOLD.sub(openSoldTokens);
        require(tokenAvailable > 0);
        uint toFund;
        uint toCollect;
        (toFund, toCollect) = costAndBuyTokens(tokenAvailable);
        if (toFund > 0) {
            require(mcopToken.mint(receipient, toCollect));         
            wallet.transfer(toFund);
            openSoldTokens = openSoldTokens.add(toCollect);
            NewSale(receipient, toFund, toCollect);             
        }

        // not enough token sale, just return eth
        uint toReturn = msg.value.sub(toFund);
        if (toReturn > 0) {
            msg.sender.transfer(toReturn);
        }
    }

    /// CONSTANT METHODS
    /// @dev Get current exchange rate
    function priceRate() public view returns (uint) {
        if (startTime <= now && now < startTime + 1 weeks ) {
            return  PRICE_RATE_FIRST;
        }else if (startTime + 1 weeks <= now && now < startTime + 2 weeks ) {
            return PRICE_RATE_SECOND;
        }else if (startTime + 2 weeks <= now && now < endTime) {
            return PRICE_RATE_LAST;
        }else {
            assert(false);
        }
        return now;
    }

    /// @dev Utility function for calculate available tokens and cost ethers
    function costAndBuyTokens(uint availableToken) constant internal returns (uint costValue, uint getTokens) {
        // all conditions has checked in the caller functions
        uint exchangeRate = priceRate();
        getTokens = exchangeRate * msg.value;

        if (availableToken >= getTokens) {
            costValue = msg.value;
        } else {
            costValue = availableToken / exchangeRate;
            getTokens = availableToken;
        }
    }

    /// @dev Internal function to determine if an address is a contract
    /// @param _addr The address being queried
    /// @return True if `_addr` is a contract
    function isContract(address _addr) constant internal returns(bool) {
        uint size;
        if (_addr == 0) {
            return false;
        }

        assembly {
            size := extcodesize(_addr)
        }
        return size > 0;
    }

    // release lock token 
    function releaseLockToken()  external onlyOwner {
        tokenTimelock.release();
    }
}
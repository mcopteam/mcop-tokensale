pragma solidity ^0.4.4;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/MCOPCrowdSale.sol";

contract TestMCOPCrowdSale {

  function testInitialBalanceUsingDeployedContract() public {
    MCOPCrowdSale sale = MCOPCrowdSale(DeployedAddresses.MCOPCrowdSale());

    //Assert.equal(sale.minBuyLimit(), 0.1 ether, "total supply shoud 10000000000 ether");

    //Assert.equal(meta.getBalance(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  }
}

var helper = require('./helper')
var MCOPCrowdSale = artifacts.require("MCOPCrowdSale");
var MCOPToken = artifacts.require("MCOPToken");
var TokenTimelock = artifacts.require("TokenTimelock");

/// Constant fields
/// mcop total tokens supply
let MCOP_TOTAL_SUPPLY = 5000000000;


let LOCK_STAKE = 48;  
let TEAM_STAKE = 8;     
let BASE_STAKE = 4;     
let ORG_STAKE = 15;      
let PERSONAL_STAKE = 25;

let DIVISOR_STAKE = 100;

contract('Test MCOPCrowdSale', function(accounts) {
  it("start", async function () {
    // let saleContract =  await MCOPCrowdSale.deployed();
  
    // let address = await saleContract.mcopToken();
    // console.log("MCOPCrowdSale start: mcopToken: " + address);
    // let tokenContract = await MCOPToken.at(address)
    // let totalSupply = await tokenContract.totalSupply();
    // console.log("MCOPToken totalSupply: " + helper.fromWei(totalSupply).valueOf());

    // let tokenOwner = await tokenContract.owner();
    // let saleOwner = await saleContract.owner();
    // console.log("MCOPToken owner: " + tokenOwner);
    // assert.equal(tokenOwner, saleOwner, "owner is ok");
    

    // let localContractAddress = await saleContract.tokenTimelock();
    // console.log("tokenTimelock start: tokenTimelock: " + localContractAddress);
    // let lockContract = await TokenTimelock.at(address) 


    // //console.log(tokenContract);
    // /////// 测试分配的值是否正确
    // let lockBalance = await tokenContract.balanceOf(localContractAddress);
    // console.log("lockBalance: " + helper.fromWei(lockBalance).valueOf());
    // assert.equal(helper.fromWei(lockBalance),  MCOP_TOTAL_SUPPLY*LOCK_STAKE/DIVISOR_STAKE, "lockBalance is ok");

    // console.log(accounts[1]);
    // let teamBalance = await tokenContract.balanceOf(accounts[1]);
    // console.log("teamBalance: " + helper.fromWei(teamBalance).valueOf());
    // assert.equal(helper.fromWei(teamBalance),  MCOP_TOTAL_SUPPLY*TEAM_STAKE/DIVISOR_STAKE, "teamBalance is ok");

    // let baseBalance = await tokenContract.balanceOf(accounts[2]);
    // console.log("baseBalance: " + helper.fromWei(baseBalance).valueOf());
    // assert.equal(helper.fromWei(baseBalance),  MCOP_TOTAL_SUPPLY*BASE_STAKE/DIVISOR_STAKE, "baseBalance is ok");

    // let orgBalance = await tokenContract.balanceOf(accounts[3]);
    // console.log("orgBalance: " + helper.fromWei(orgBalance).valueOf());
    // assert.equal(helper.fromWei(orgBalance),  MCOP_TOTAL_SUPPLY*ORG_STAKE/DIVISOR_STAKE, "orgBalance is ok");

    // let perBalance = await tokenContract.balanceOf(accounts[4]);
    // console.log("perBalance: " + helper.fromWei(perBalance).valueOf());
    // assert.equal(helper.fromWei(perBalance),  MCOP_TOTAL_SUPPLY*PERSONAL_STAKE/DIVISOR_STAKE, "perBalance is ok");
  });


  it('unlock token', async function(){
    let saleContract = await MCOPCrowdSale.new(accounts[0], accounts[1],accounts[2],accounts[3],accounts[4]);

    let tokenAddress = await saleContract.mcopToken();
    console.log("MCOPCrowdSale start: mcopToken: " + tokenAddress);
    let tokenContract = await MCOPToken.at(tokenAddress);

    let localContractAddress = await saleContract.tokenTimelock();
    console.log("tokenTimelock: tokenTimelock: " + localContractAddress);
    let lockContract = await TokenTimelock.at(localContractAddress) 
    
    // //必须把release的时间改为  3 seconds 才能正确测试这段代码
    // try{
    //   result = await saleContract.releaseLockToken();
    //   console.log(result);
    // }catch(err){
    //   console.log(err);
    //   for(var i = 0; i < 1000000000; i++){
    //     var j = i; 
    //     j = j*10;
    //     j = j**10;
    //   }

    //   console.log('releaseLockToken')
    //   result = await saleContract.releaseLockToken();
    //   console.log(result);

    //   let lockBalance = await tokenContract.balanceOf(accounts[0]);
    //   assert.equal(helper.fromWei(lockBalance),  MCOP_TOTAL_SUPPLY*LOCK_STAKE/DIVISOR_STAKE, "lockBalance is ok");

    //   let lockContractBalance = await tokenContract.balanceOf(localContractAddress);
    //   console.log("lockContractBalance: " + helper.fromWei(lockContractBalance).valueOf());
    //   assert.equal(helper.fromWei(lockContractBalance),  0, "lockContractBalance is ok");
    // }
});

});

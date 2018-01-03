App = {
  web3Provider: null,
  contracts: {},

  //defaultAccount:"",

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('MCOPCrowdSale.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var MCOPCrowdSaleArtifact = data;
      App.contracts.MCOPCrowdSale = TruffleContract(MCOPCrowdSaleArtifact);

      // Set the provider for our contract.
      App.contracts.MCOPCrowdSale.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      App.contracts.MCOPCrowdSale.deployed().then(function(instance){
        console.log(instance);
        var saleContract = instance;
        return saleContract.mcopToken();
      }).then(function(result) {
        //alert(result);
        //return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
      
      $.getJSON('MCOPToken.json', function(data) {
        var MCOPTokenArtifact = data;
        App.contracts.MCOPToken = TruffleContract(MCOPTokenArtifact);
  
        // Set the provider for our contract.
        App.contracts.MCOPToken.setProvider(App.web3Provider);

        $.getJSON('TokenTimelock.json', function(data) {
          var TokenTimelockArtifact = data;
          App.contracts.TokenTimelock = TruffleContract(TokenTimelockArtifact);
    
          // Set the provider for our contract.
          App.contracts.TokenTimelock.setProvider(App.web3Provider);      
          App.getPausedStatus();
          App.getLimitValue();
          App.getLockTime();
          App.getBalances();
          App.getAdmin();
          App.getWallet();
        });

      });
    });

    

    return App.bindEvents();
  },

  fromWei:function(n) {
    return new web3.BigNumber(web3.fromWei(n, 'ether'))
  },

  toWei:function(n) {
    return new web3.BigNumber(web3.toWei(n, 'ether'))
  },

  checkArgs:function(){
    
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#submitAddressButton', App.handleSubmitAdmin);
    $(document).on('click', '#walletAddressButton', App.handleSubmitWallet);
    $(document).on('click', '#limitButton', App.handleSubmitLimit);
    $(document).on('click', '#whiteListButton', App.handleSubmitWL);
    $(document).on('click', '#releaseButton', App.handleRelease);
    $(document).on('click', '#buyToken', App.handleBuy);
    $(document).on('click', '#pauseSaleButton', App.handlePauseSale);
    $(document).on('click', '#pauseTokenButton', App.handlePauseToken);
    $(document).on('click', "#refresh", App.handleRefresh);
    $(document).on('click', "#balanceButton", App.handleGetBalance);
    $(document).on('click', "#settingButton", App.handleSetting);
  },

  handleRefresh:function(event){
    App.getPausedStatus();
    App.getLimitValue();
    App.getLockTime();
    App.getBalances();
    App.getAdmin();
    App.getWallet();
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#MCTTransferAmount').val());
    var toAddress = $('#MCTTransferAddress').val();

    console.log('Transfer ' + amount + ' MCT to ' + toAddress);

    var mcopTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
        mcopTokenInstance = instance;

        return mcopTokenInstance.transfer(toAddress, amount, {from: account, gasLimit:20000, gasPricie:200});
      }).then(function(result) {
        alert('submit admin Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  handleSubmitAdmin: function(event){
    event.preventDefault();
    var account = $("#adminAdress").val();
    if( account == null || account.length <= 0){
      alert("new admin is empty");
      return ;
    }
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      mcopTokenInstance = instance;
      return instance.transferOwnership(account);
    }).then(function(result) {
      //web3.eth.defaultAccount = account;
      App.getAdmin();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleSubmitWallet: function(event){
    event.preventDefault();
    var account = $("#walletAdress").val();
    if( account == null || account.length <= 0){
      alert("new wallet is empty");
      return ;
    }
  
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      mcopTokenInstance = instance;
      return instance.setWallet(account,{gasLimit:App.gasLimit, gasPrice:App.gasPrice});
    }).then(function(result) {
      //web3.eth.defaultAccount = account;
      App.getWallet();
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleSubmitLimit: function(event){
    event.preventDefault();
    var account = $("#walletAdress").val();
    if( account == null || account.length <= 0){
      alert("new wallet is empty");
      return ;
    }
  
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      mcopTokenInstance = instance;
      return instance.setWallet(account);
    }).then(function(result) {
      //web3.eth.defaultAccount = account;
      App.getWallet();
    }).catch(function(err) {
      console.log(err.message);
    });

  },

  handleSubmitWL: function(event){
    event.preventDefault();
  },

  handleRelease: function(event){
    event.preventDefault();
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      return instance.releaseLockToken();
    }).then(function(result) {
      alert("release ok");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleBuy: function(event){
    event.preventDefault();
    var eth = parseFloat($("#eth").val());
    if( eth == null || eth <= 0 || isNaN(eth)){
      alert("eth is empty");
      return ;
    }
    var saleContract = null;
    App.contracts.MCOPCrowdSale.deployed().then(function(instance){
      saleContract = instance;
      return saleContract.minBuyLimit();
    }).then(function(value) {
      var minEth = parseFloat(App.fromWei(value));
      if( minEth > eth){
        alert("eth is too small, must bigger than "+minEth);
        return ;
      }else{
        return saleContract.maxBuyLimit();
      }
    }).then(function(value) {
      var maxEth = parseFloat(App.fromWei(value));
      if( maxEth < eth){
        alert("eth is too big, must smaller than "+maxEth);
        return ;
      }else{
        return web3.eth.sendTransaction({to:saleContract.address ,value:App.toWei(eth)}, function(error, transactionHash){
          console.log(error);
          console.log(ertransactionHashror);
        });
      }
    }).then(function(value) {
      alert('buy ok')
    }).catch(function(err) {
      alert(err.message);
    });
  },

  handlePauseSale: function(event){
    event.preventDefault();

    var saleStatus = $("#pauseSaleButton").attr('data-id');
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      mcopTokenInstance = instance;
      if(saleStatus == "true"){
        return instance.unpause();
      }else{
        return instance.pause();
      }
    }).then(function(result) {
      App.getPausedStatus();
    }).catch(function(err) {
      alert(err.message);
    });

  },

  handlePauseToken: function(event){
    event.preventDefault();
  
    var saleStatus = $("#pauseTokenButton").attr('data-id');

    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      return instance.mcopToken();
    }).then(function(value) {
      tokenContractAddress = value;
      return App.contracts.MCOPToken.at(tokenContractAddress);
    }).then(function(value) {
      mcopTokenContract = value;
      if(saleStatus == "true"){
        return mcopTokenContract.unpause();
      }else{
        return mcopTokenContract.pause();
      }  
    }).then(function(result) {
      App.getPausedStatus();
    }).catch(function(err) {
      alert(err.message);
    });
  
  },

  handleGetBalance: function(event){
    event.preventDefault();
  
    var address = $("#Address").val();
    if( address == null || address.length <= 0){
      alert("address is empty");
      return ;
    }
    App.contracts.MCOPCrowdSale.deployed().then(function(instance) {
      return instance.mcopToken();
    }).then(function(value) {
      tokenContractAddress = value;
      return App.contracts.MCOPToken.at(tokenContractAddress);
    }).then(function(value) {
      mcopTokenContract = value;
      return mcopTokenContract.balanceOf(address);
    }).then(function(val) {
      $("#MPCBalance").text(App.fromWei(val));
    }).catch(function(err) {
      alert(err.message);
    });

  },

  handleSetting: function(event){
    event.preventDefault();

  },

  setPausedStatus:function(isPaused, id, button){
    console.log(isPaused);
    $("#"+id).text(isPaused?"停止":"启动");
    $("#"+button).text(isPaused?"start":"paused");
    $("#"+button).text(isPaused?"start":"paused");
    $("#"+button).attr('data-id', isPaused);
  },

  getPausedStatus:function(account){
    console.log('Getting getPausedStatus...');
    var saleContract = null;
    var tokenContractAddress = null;
    App.contracts.MCOPCrowdSale.deployed().then(function(instance){
      console.log(instance);
      saleContract = instance;
      return saleContract.mcopToken();
    }).then(function(value) {
      tokenContractAddress = value;
      return saleContract.paused();
    }).then(function(value) {
      App.setPausedStatus(value, "saleStatus", "pauseSaleButton");
      return App.contracts.MCOPToken.at(tokenContractAddress);
    }).then(function(value){
      var tokenContract = value;
      return tokenContract.paused()
    }).then(function(value) {
      App.setPausedStatus(value, "tokenStatus", "pauseTokenButton");
    }).catch(function(err) {
      alert(err.message);
    });

  },

  getLockTime:function(account){
    console.log('Getting getLockTime...');
  },

  getLimitValue: function(account) {
    console.log('Getting getLimitValue...');
    var saleContract = null;
    App.contracts.MCOPCrowdSale.deployed().then(function(instance){
      console.log(instance);
      saleContract = instance;
      return saleContract.minBuyLimit();
    }).then(function(value) {
      $("#minLimit").text(App.fromWei(value)+'eth');
      return saleContract.maxBuyLimit();
    }).then(function(value) {
      $("#maxLimit").text(App.fromWei(value)+'eth');
    }).catch(function(err) {
      alert(err.message);
    });

  },

  getAdmin:function(account){
    console.log('Getting getAdmin...');
    var saleContract = null;
    App.contracts.MCOPCrowdSale.deployed().then(function(instance){
      console.log(instance);
      saleContract = instance;
      return saleContract.owner();
    }).then(function(value) {
      $("#admin").text(value);
      $("#admin").attr("href", "https://etherscan.io/address/"+value);
    }).catch(function(err) {
      alert(err.message);
    });
  },

  getWallet:function(account){
    console.log('Getting getWallet...');
    var saleContract = null;
    App.contracts.MCOPCrowdSale.deployed().then(function(instance){
      console.log(instance);
      saleContract = instance;
      return saleContract.wallet();
    }).then(function(value) {
      $("#wallet").text(value);
      $("#wallet").attr("href", "https://etherscan.io/address/"+value);
    }).catch(function(err) {
      console.log(err.message);
    });
  },


  getBalances: function(adopters, account) {
    console.log('Getting balances...');

    // var mcopTokenInstance;

    // web3.eth.getAccounts(function(error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }

      // var account = accounts[0];

      // App.contracts.MCOPToken.deployed().then(function(instance) {
      //   mcopTokenInstance = instance;

      //   return mcopTokenInstance.balanceOf(account);
      // }).then(function(result) {
      //   balance = result.c[0];

      //   $('#MCTBalance').text(balance);
      // }).catch(function(err) {
      //   console.log(err.message);
      // });
    // });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});

App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load goods.
    $.getJSON('../goods.json', function(data) {
      var goodsRow = $('#goodsRow');
      var goodTemplate = $('#goodTemplate');

      for (i = 0; i < data.length; i ++) {
        goodTemplate.find('.panel-title').text(data[i].name);
        goodTemplate.find('img').attr('src', data[i].picture);
        goodTemplate.find('.good-type').text(data[i].type);
        goodTemplate.find('.good-price').text(data[i].price);
        goodTemplate.find('.good-location').text(data[i].location);
        goodTemplate.find('.btn-purchase').attr('data-id', data[i].id);

        goodsRow.append(goodTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('PurchaseGoods.json', function(data) {

      var GoodsArtifact = data;
      App.contracts.PurchaseGoods = TruffleContract(GoodsArtifact);

      App.contracts.PurchaseGoods.setProvider(App.web3Provider);

      return App.markPurchased();
    });

    $.getJSON('TutorialToken.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var TutorialTokenArtifact = data;
      App.contracts.TutorialToken = TruffleContract(TutorialTokenArtifact);

      // Set the provider for our contract.
      App.contracts.TutorialToken.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
    $(document).on('click', '.btn-donate', App.handleDonation);
  },
  
  markPurchased: function(customers, account) {
    var purchaseGoodsInstance;

    App.contracts.PurchaseGoods.deployed().then(function(instance) {
      purchaseGoodsInstance = instance;

      return purchaseGoodsInstance.getCustomers.call();
    }).then(function(customers) {
      for (i = 0; i < customers.length; i++) {
        if (customers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-goods').eq(i).find('button').text('Selected').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handlePurchase: function(event) {
    event.preventDefault();
    
    var goodId = parseInt($(event.target).data('id'));
    var goodPrice = 0;

    $.getJSON('../goods.json', function(data) {
      
      for (i = 0; i < data.length; i ++) {
        //console.log('id = ' + data[i].id);
        //console.log('price = ' + data[i].price);

        if (goodId == data[i].id){
           goodPrice = parseInt(data[i].price);
           console.log('found id = ' + data[i].id);
        }
      }
    
      console.log('handlePurchase : id = ' + goodId);
      console.log('handlePurchase: price = ' + goodPrice);
    
      var purchaseGoodsInstance;
      var tutorialTokenInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        var toAddress = $('#TTProviderAddress').val();

        console.log('handlePurchase : Purchase account = ' + account);

        App.contracts.TutorialToken.deployed().then(function(instance) {
          tutorialTokenInstance = instance;

          return tutorialTokenInstance.transfer(toAddress, goodPrice, {from: account, gas: 100000});
        }).then(function(result) {
          alert('Purchase Successful!');
          return App.handlePurchaseItem(goodId);          
        }).catch(function(err) {
          if (err.message.indexOf('revert') >= 0 ){
             alert('Purchase Failed! : Insufficient Funds');
          };            
          console.log(err.message);
        });
      });
    });    
  },

  handlePurchaseItem: function(goodId) {
    
      var purchaseGoodsInstance;
      var tutorialTokenInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        console.log('Purchase account = ' + account);

        App.contracts.PurchaseGoods.deployed().then(function(instance) {
          purchaseGoodsInstance = instance;

          // Execute purchase as a transaction by sending account
          return purchaseGoodsInstance.purchase(goodId, {from: account});
        }).then(function(result) {          
          return App.markPurchased();
        }).catch(function(err) {
          alert('Purchase Failed! : ' + err.message);
          console.log(err.message);
        });
        
        return App.getBalances();
    });
    
  },

   handleDonation: function(event) {
    event.preventDefault();

    var amount = parseInt($('#TTDonateAmount').val());
    var toAddress = $('#TTDonateAddress').val();

    console.log('Donate ' + amount + ' TT to ' + toAddress);

    var tutorialTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log('Donate ' + account);

      App.contracts.TutorialToken.deployed().then(function(instance) {
        tutorialTokenInstance = instance;

        return tutorialTokenInstance.transfer(toAddress, amount, {from: account, gas: 100000});
      }).then(function(result) {
        alert('Donation Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function() {
    console.log('Getting balances...');

    var tutorialTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      var account1 = accounts[1];

      console.log('accounts[0] = ' + account);
      console.log('accounts[1] = ' + account1);
      
      App.contracts.TutorialToken.deployed().then(function(instance) {
        tutorialTokenInstance = instance;

        return tutorialTokenInstance.balanceOf(account);
      }).then(function(result) {
        console.log('balance = ' + 0);
        balance = result.c[0];
        console.log('balance = ' + balance);
        $('#TTBalance').text(balance);
        $('#TTAddress').text(account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  openTab: function(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
  } 

};


$(function() {
  $(window).load(function() {
    App.init();
  });
});

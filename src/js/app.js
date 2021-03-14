App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load goods from the JSON file goods.json
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
    // Initialise and connect Web3 providers

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
    // Note: Using port 7545!
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    
    $.getJSON('PurchaseGoods.json', function(data) {
      // Get the necessary contract artifact file
      // Instantiate it with truffle-contract.
      var GoodsArtifact = data;
      App.contracts.PurchaseGoods = TruffleContract(GoodsArtifact);

      // Set the contract provider.
      App.contracts.PurchaseGoods.setProvider(App.web3Provider);

      //  Loop the goods and mark any as purchased which have an address associated with them
      return App.markPurchased();
    });

    $.getJSON('ThankYouToken.json', function(data) {
      // Get the necessary contract artifact file
      // Instantiate it with truffle-contract.
      var ThankYouTokenArtifact = data;
      App.contracts.ThankYouToken = TruffleContract(ThankYouTokenArtifact);

      // Set the contract provider.
      App.contracts.ThankYouToken.setProvider(App.web3Provider);

      // Retrieve the balances
      return App.getBalances();
    });

    return App.bindEvents();
  },

  //  Bind the UI controls to the JS functions
  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchaseEvent);
    $(document).on('click', '.btn-donate', App.handleDonation);
  },
  
  //  Function to indicate to the end user which goods have already been purchased
  markPurchased: function(customers, account) {
    var purchaseGoodsInstance;

    //  Get an instance of the deployed contract 
    App.contracts.PurchaseGoods.deployed().then(function(instance) {
      purchaseGoodsInstance = instance;

      return purchaseGoodsInstance.getCustomers.call();
    }).then(function(customers) {
      //  Loop the customers. Any with an address, update the button caption to Selected and disable the control      
      for (i = 0; i < customers.length; i++) {
        if (customers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-goods').eq(i).find('button').text('Selected').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handlePurchaseEvent: function(event) {
    event.preventDefault();
    
    var goodId = parseInt($(event.target).data('id'));
    var goodPrice = 0;

    var purchaseGoodsInstance;

      //  Ensure we can access the accounts 
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        console.log('Purchase account = ' + account);

        // Get an instance of the deployed contract
        App.contracts.PurchaseGoods.deployed().then(function(instance) {
          purchaseGoodsInstance = instance;

          //  Execute purchase of goods to the customer
          return purchaseGoodsInstance.purchase(goodId, {from: account});
        }).then(function(result) {
          //  Update UI to indicate the goods have been purchased
          return App.markPurchased();
        }).catch(function(err) {
          alert('Purchase Failed! : ' + err.message);
          console.log(err.message);
        });
        
    });

  },    

  // Function to record goods as purchased
  handlePurchase: function(event) {
    event.preventDefault();
    
    var goodId = parseInt($(event.target).data('id'));
    var goodPrice = 0;    
     
    //  Retrieve the price of goods based on the id
    $.getJSON('../goods.json', function(data) {
      
      for (i = 0; i < data.length; i ++) {        

        if (goodId == data[i].id){
           goodPrice = parseInt(data[i].price);
           console.log('found id = ' + data[i].id);
        }
      }
    
      console.log('handlePurchase : id = ' + goodId);
      console.log('handlePurchase: price = ' + goodPrice);
    
      var thankYouTokenInstance;

      //  Ensure we can access the accounts
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];
        var toAddress = $('#TUProviderAddress').val();

        // validate that the user has entered the provider address
        if ( toAddress == '' || toAddress == '0x0' ) {           
           alert('Please enter a provider address');
        }
        else{
           console.log('handlePurchase : Purchase account = ' + account);

           // Get an instance of the deployed contract
           App.contracts.ThankYouToken.deployed().then(function(instance) {
             thankYouTokenInstance = instance;

             // Transfer the funds to the provider
             return thankYouTokenInstance.transfer(toAddress, goodPrice, {from: account, gas: 100000});
           }).then(function(result) {
             alert('Purchase Successful!');
             // Transfer the goods to the purchaser
             return App.handlePurchaseItem(goodId);          
           }).catch(function(err) {
             if (err.message.indexOf('revert') >= 0 ){
                alert('Purchase Failed! : Insufficient Funds');
             };            
             console.log(err.message);
           });
        }
      });
    });    
  },

  // Function to support a customer purchasing goods
  handlePurchaseItem: function(goodId) {
    
      var purchaseGoodsInstance;

      //  Ensure we can access the accounts 
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        console.log('Purchase account = ' + account);

        // Get an instance of the deployed contract
        App.contracts.PurchaseGoods.deployed().then(function(instance) {
          purchaseGoodsInstance = instance;

          //  Execute purchase of goods to the customer
          return purchaseGoodsInstance.purchase(goodId, {from: account});
        }).then(function(result) {
          //  Update UI to indicate the goods have been purchased
          return App.markPurchased();
        }).catch(function(err) {
          alert('Purchase Failed! : ' + err.message);
          console.log(err.message);
        });
        
        //  Update account balance on the UI
        return App.getBalances();
    });
    
  },

  //  Function to support donating thank you tokens
  handleDonation: function(event) {
    event.preventDefault();

    //  Get the user input
    var amount = parseInt($('#TUDonateAmount').val()) || 0 ;
    var toAddress = $('#TUDonateAddress').val();

    console.log('Donate ' + amount + ' THKU to ' + toAddress);

    //  Validate the user input
    if ( amount <= 0 ) {
       alert('Please enter an amount');
    }
    else if ( amount > 10000 ) {
       //  Want to prevent all tokens being used in one transaction
       alert('Donations can not exceed 10,000');
    } 
    else if ( toAddress == '' || toAddress == '0x0' ) {
       alert('Please enter an address');
    }
    else{ 
       var thankYouTokenInstance;

       //  Ensure we can access the accounts
       web3.eth.getAccounts(function(error, accounts) {
         if (error) {
           console.log(error);
         }

         var account = accounts[0];

         console.log('Donate ' + account);

         // Get an instance of the deployed contract
         App.contracts.ThankYouToken.deployed().then(function(instance) {
           thankYouTokenInstance = instance;

           // Transfer the tokens
           return thankYouTokenInstance.transfer(toAddress, amount, {from: account, gas: 100000});
         }).then(function(result) {
           alert('Donation Successful!');
           
           //  Update account balance on the UI 
           return App.getBalances();
         }).catch(function(err) {
           console.log(err.message);
         });
       });
     }
  },

  //  Function to update the account balances on the user interface
  getBalances: function() {
    console.log('Getting balances...');

    var thankYouTokenInstance;

    //  Ensure we can access the accounts
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      console.log('accounts[0] = ' + account);
      
      // Get an instance of the deployed contract
      App.contracts.ThankYouToken.deployed().then(function(instance) {
        thankYouTokenInstance = instance;

        // Get the token balance 
        return thankYouTokenInstance.balanceOf(account);
      }).then(function(result) {
        console.log('balance = ' + 0);
        balance = result.c[0];        
        console.log('balance = ' + balance);
        //  Update the UI
        $('#TUBalance').text(balance);
        $('#TUAddress').text(account);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};


$(function() {
  $(window).load(function() {
    App.init();
  });
});

pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/PurchaseGoods.sol";

contract TestPurchaseGoods {
  // The address of the PurchaseGoods contract to be tested
  PurchaseGoods purchaseGoods = PurchaseGoods(DeployedAddresses.PurchaseGoods());

  // The id of the pet that will be used for testing
  uint expectedGoodsId = 8;

  //The expected owner of goods is this contract
  address expectedCustomer = address(this);

  // Testing the purchase() function
  function testUserCanPurchaseGoods() public {
    uint returnedId = purchaseGoods.purchase(expectedGoodsId);

    Assert.equal(returnedId, expectedGoodsId, "Purchase of the expected goods should match what is returned.");
  }

  // Testing retrieval of a single good's owner
  function testGetPurchaseGoodsAddressByGoodsId() public {
   address customer = purchaseGoods.customers(expectedGoodsId);

   Assert.equal(customer, expectedCustomer, "Owner of the expected goods should be this contract");
  }

  // Testing retrieval of all goods owners
  function testGetPurchaseGoodsAddressByGoodsIdInArray() public {
   // Store customers in memory rather than contract's storage
   address[16] memory customers = purchaseGoods.getCustomers();

   Assert.equal(customers[expectedGoodsId], expectedCustomer, "Owner of the expected goods should be this contract");
  }
}

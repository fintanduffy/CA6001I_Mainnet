pragma solidity ^0.6.0;

contract PurchaseGoods {
  address[16] public customers;

  // Selecting goods
  function purchase(uint goodId) public returns (uint) {
    require(goodId >= 0 && goodId <= 15);

    customers[goodId] = msg.sender;

    return goodId;
  }

  // Retrieving the customers
  function getCustomers() public view returns (address[16] memory) {
    return customers;
  }
}

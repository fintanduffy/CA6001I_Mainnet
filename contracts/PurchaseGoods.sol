pragma solidity ^0.6.0;

//  Contract to allow customers to purchahse goods

contract PurchaseGoods {
  
  // As there are 16 goods in the sample set we are 
  // creating an array of addresses for 16 potential customers

  address[16] public customers;

  // Function to assign an customer address for a given good
  function purchase(uint goodId) public returns (uint) {
    // Ensure we have a valid id
    require(goodId >= 0 && goodId <= 15);

    customers[goodId] = msg.sender;

    return goodId;
  }

  // Retrieving the customers
  function getCustomers() public view returns (address[16] memory) {
    return customers;
  }
}

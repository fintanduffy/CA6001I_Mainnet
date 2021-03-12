pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

//  ERC20 token using the openzeppelin library

contract ThankYouToken is ERC20 {

  // Token name = ThankYou
  // Token symbol = THKU1
   
  // Setting the initial supply to 1,000,000

  constructor() public ERC20("ThankYou", "THKU") {
     _mint(msg.sender, 1000000); 
  }
}

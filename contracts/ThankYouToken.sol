pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ThankYouToken is ERC20 {

  constructor() public ERC20("ThankYou", "THKU") {
     _mint(msg.sender, 12000); 
  } 

}

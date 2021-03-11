pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {

  constructor() public ERC20("Tutorial", "TT") {
     _mint(msg.sender, 12000); 
  } 

}

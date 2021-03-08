pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TutorialToken is ERC20 {

  // string public override name = "TutorialToken";
  // string public override symbol = "TT";
  // uint8 public decimals = 2;
  // uint public INITIAL_SUPPLY = 12000;

  // constructor(uint256 initialSupply) public ERC20("Tutorial", "TT") {
  constructor() public ERC20("Tutorial", "TT") {
     _mint(msg.sender, 12000); 
  } 

}

pragma solidity ^0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/ThankYouToken.sol";

contract TestThankYouToken {
  // The address of the PurchaseGoods contract to be tested
  ThankYouToken thankYouToken = ThankYouToken(DeployedAddresses.ThankYouToken());

  string expectedName = "ThankYou";
  string expectedSymbol = "THKU";
  uint expectedSupply = 12000;

  address receiptAddress = 0x113D1a42C83F8B8E9F173a769EAe91efAc080aCe;

  // Testing the token attributes function
  function testTokenName() public {
    string memory actualName = thankYouToken.name();

    Assert.equal(actualName, expectedName, "Token has the correct name");
  }
   
  function testTokenSymbol() public {
    string memory actualSymbol = thankYouToken.symbol();

    Assert.equal(actualSymbol, expectedSymbol, "Token has the correct symbol");
  } 

  function testTokenSupply() public {
    uint actualSupply = thankYouToken.totalSupply();

    Assert.equal(expectedSupply, actualSupply, "Token has the correct supply");
  }

  function testBalanceOf() public {
    uint senderBalance = thankYouToken.balanceOf(msg.sender);

    Assert.equal(expectedSupply, senderBalance, "Contract has the correct balance");
  }  
  
  function testTransferFailException() public {
    bool result = thankYouToken.transfer(receiptAddress, 99999999999999999999999);

    Assert.isFalse(result, "Transfer should fail");
  }

}

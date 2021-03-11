var PurchaseGoods = artifacts.require("PurchaseGoods");
var TutorialToken = artifacts.require("TutorialToken");
var ThankYouToken = artifacts.require("ThankYouToken");

module.exports = function(deployer) {
  deployer.deploy(PurchaseGoods);
  deployer.deploy(TutorialToken);
  deployer.deploy(ThankYouToken);
};

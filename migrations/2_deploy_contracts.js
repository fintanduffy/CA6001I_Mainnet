var PurchaseGoods = artifacts.require("PurchaseGoods");
var ThankYouToken = artifacts.require("ThankYouToken");

module.exports = function(deployer) {
  deployer.deploy(PurchaseGoods);
  deployer.deploy(ThankYouToken);
};

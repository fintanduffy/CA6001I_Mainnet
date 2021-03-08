var Adoption = artifacts.require("Adoption");
var PurchaseGoods = artifacts.require("PurchaseGoods");
var TutorialToken = artifacts.require("TutorialToken");

module.exports = function(deployer) {
  deployer.deploy(Adoption);
  deployer.deploy(PurchaseGoods);
  deployer.deploy(TutorialToken);
};

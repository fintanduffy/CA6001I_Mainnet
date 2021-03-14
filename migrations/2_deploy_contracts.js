var PurchaseGoods = artifacts.require("PurchaseGoods");

module.exports = function(deployer) {
  deployer.deploy(PurchaseGoods);
};

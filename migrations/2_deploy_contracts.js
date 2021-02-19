const Dealer = artifacts.require("Dealer");

module.exports = function (deployer) {
  deployer.deploy(Dealer);
};

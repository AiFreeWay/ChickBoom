const ConvertLib = artifacts.require("ConvertLib");
const ChickBoom = artifacts.require("ChickBoom");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, ChickBoom);
  deployer.deploy(ChickBoom, 3, 1000000000000000);
};

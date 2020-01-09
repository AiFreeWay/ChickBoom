const ConvertLib = artifacts.require("ConvertLib");
const ChickBoom = artifacts.require("ChickBoom");

module.exports = function(deployer) {
  console.log("B");
  deployer.deploy(ConvertLib);
  console.log("B1");
  deployer.link(ConvertLib, ChickBoom);
  console.log("B2");
  deployer.deploy(ChickBoom);
  console.log("B3");
};

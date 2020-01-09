const Migrations = artifacts.require("Migrations");

module.exports = function(deployer) {
  console.log("A");
  deployer.deploy(Migrations);
  console.log("A1");
};

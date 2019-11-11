const DeployedAddresses = require("truffle")["DeployedAddresses"];
const ChickBoom = artifacts.require("ChickBoom");


contract("ChickBoom", accounts => {
  it("Buy ticket, play and win", async function() {
    let wei_for_buying = 500000000000000000;
    let contract;
    let balance;
    let balance_after_buy;
    let balance_after_win;

    await ChickBoom.deployed()
      .then(async function(instance) {
        contract = instance;
        return web3.eth.getBalance(accounts[1]);
      })
      .then(_balance => {
        balance = _balance;
        return contract.get_owner();
      })
      .then(_owner => {
        _owner_addr = _owner;
        return contract.change_tickets_count(1);
      })
      .then(_void => contract.get_tickets_count())
      .then(tickets_count => {
          assert.equal(tickets_count, 1, "tickets count not 1");
      })
      .then(_void => contract.start_tickets_selling())
      .then(_void => contract.buy_ticket({ from: accounts[1], value: wei_for_buying }))
      .then(_void => web3.eth.getBalance(accounts[1]))
      .then(_balance => {
          balance_after_buy = _balance;
          assert.equal((balance-balance_after_buy) >= wei_for_buying, true, "Coins dont send");
      })
      .then(_void => contract.get_lottery_state())
      .then(state => {
          assert.equal(state, 1, "tickets selling not start");
          return contract.start_lottery();
      })
      .then(_void => web3.eth.getBalance(accounts[1]))
      .then(_balance_after_win => {
          balance_after_win = _balance_after_win;
          assert.equal((_balance_after_win-balance_after_buy) >= wei_for_buying, true, "Coins dont receive");
      })
      .then(_void => contract.get_lottery_state())
      .then(state => {
          assert.equal(state, 0, "tickets selling not end");
      });
  });

  it("Buy ticket, reward", async function() {
    let wei_for_buying = 500000000000000000;
    let contract;
    let balance;
    let balance_after_buy;
    let balance_after_win;

    await ChickBoom.deployed()
      .then(async function(instance) {
        contract = instance;
        return web3.eth.getBalance(accounts[1]);
      })
      .then(_balance => {
        balance = _balance;
        return contract.get_owner();
      })
      .then(_owner => {
        _owner_addr = _owner;
        return contract.change_tickets_count(1);
      })
      .then(_void => contract.get_tickets_count())
      .then(tickets_count => {
          assert.equal(tickets_count, 1, "tickets count not 1");
      })
      .then(_void => contract.start_tickets_selling())
      .then(_void => contract.buy_ticket({ from: accounts[1], value: wei_for_buying }))
      .then(_void => web3.eth.getBalance(accounts[1]))
      .then(_balance => {
          balance_after_buy = _balance;
          assert.equal((balance-balance_after_buy) >= wei_for_buying, true, "Coins dont send");
      })
      .then(_void => contract.get_lottery_state())
      .then(state => {
          assert.equal(state, 1, "tickets selling not start");
          return contract.reward();
      })
      .then(_void => web3.eth.getBalance(accounts[1]))
      .then(_balance_after_win => {
          balance_after_win = _balance_after_win;
          assert.equal((_balance_after_win-balance_after_buy) >= wei_for_buying, true, "Coins dont receive");
      })
      .then(_void => contract.get_lottery_state())
      .then(state => {
          assert.equal(state, 0, "tickets selling not end");
      });
  });
});

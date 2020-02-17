const DeployedAddresses = require("truffle")["DeployedAddresses"];
const ChickBoom = artifacts.require("ChickBoom");

contract("ChickBoom", async accounts => {
  //!!! Default ChickBoom creates with 3 ticket, 100000000000000 ticket price and 10000000000000 owner round refound

  it("Credit contract", async () => {
    let contract = await ChickBoom.deployed();
    contract.sendTransaction({ from: accounts[0], value: 50000000000000000, gasPrice: 1000000000 })
  });

  //BUY TICKET FAILURE - SELLING NOT STARTED

  it("Buy ticket failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.buy_ticket({ from: accounts[1], value: 100000000000000, gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Invalid state") > 0);
  });

  //REFOUND FAILURE - SELLING NOT STARTED

  it("Refound failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.refound({ from: accounts[1]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Invalid state") > 0);
  });

  //LETS WIN FAILURE - SELLING NOT STARTED

  it("Lets winn failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.lets_win({ from: accounts[0]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Invalid state") > 0);
  });

  //START SELLING

  it("Start selling failure - not owner", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.start_selling({ from: accounts[1], gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Need owner permission") > 0);
  });

  it("Start selling success", async () => {
    let contract = await ChickBoom.deployed();
    let lottery_state;
    await contract.start_selling({ from: accounts[0], gasPrice: 1000000000 })
      .then(() => contract.get_lottery_state({ from: accounts[1], gasPrice: 1000000000 }))
      .then(state => { lottery_state = state; });
    assert.equal(lottery_state, 1);
  });

  it("Start selling failure - already started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.start_selling({ from: accounts[0], gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Invalid state") > 0);
  });

  //BUY TICKET FAILURE - NOT ENOUGHT COINS

  it("Buy ticket failure - Not enought amount", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.buy_ticket({ from: accounts[1], value: 10000, gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Not enought amount") > 0);
  });

  //BUY TICKET SUCCESS

  it("Buy ticket success wallet 1", async () => {
    let contract = await ChickBoom.deployed();
    await contract.buy_ticket({ from: accounts[1], value: 100000000000000, gasPrice: 1000000000 })
      .catch(err => assert.ok(false));
  });

  //REFOUND FAILURE - HAVE NOT TICKETS

  it("Refound failure - have not ticket", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.refound({ from: accounts[2]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not ticket") > 0);
  });

  //REFOUND SUCCESS

  it("Refound success", async () => {
    let contract = await ChickBoom.deployed();
    await contract.refound({ from: accounts[1]})
      .catch(err => assert.ok(false));
  });

  //LETS WIN FAILURE

  it("Lets win failure - not owner", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.lets_win({ from: accounts[1]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Need owner permission") > 0);
  });

  it("Lets win - tickets not solded", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.lets_win()
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Invalid state") > 0);
  });

  //START LOTTERY

  it("Buy ticket success wallet 1", async () => {
    let contract = await ChickBoom.deployed();
    await contract.buy_ticket({ from: accounts[1], value: 100000000000000, gasPrice: 1000000000 })
      .catch(err => assert.ok(false));
  });

  it("Buy ticket success wallet 2", async () => {
    let contract = await ChickBoom.deployed();
    await contract.buy_ticket({ from: accounts[2], value: 100000000000000, gasPrice: 1000000000 })
      .catch(err => assert.ok(false));
  });

  it("Buy ticket success wallet 3 and finish lottery", async () => {
    let contract = await ChickBoom.deployed();
    let winner_address;
    let winner_balance_before_win;
    await contract.buy_ticket({ from: accounts[3], value: 100000000000000, gasPrice: 1000000000 })
      .then(() => contract.buy_ticket({ from: accounts[4], value: 100000000000000, gasPrice: 1000000000 }))
      .catch(err => {
        assert.ok(err.toString().indexOf("Invalid state") > 0);
        return contract.lets_win();
      })
      .then(() => contract.get_lottery_state())
      .then(state => assert.equal(state, 0))
      .then(() => contract.getPastEvents('WinEvent', { fromBlock: 0, toBlock: 'latest' }))
      .then(events => {
        assert.equal(events[0].returnValues.cush, 290000000000000);
        assert.equal(events[0].returnValues.round, 1);
        winner_address = events[0].returnValues.winner;
      })
      .then(() => web3.eth.getBalance(winner_address))
      .then(balance => {
        winner_balance_before_win = balance;
      })
      .then(() => contract.get_cush(1, { from: winner_address, gasPrice: 1000000000 }))
      .then(() => web3.eth.getBalance(winner_address))
      .then(balance => assert.ok(balance > winner_balance_before_win))
  });

  //REWARD FOR OWNER

  it("Reward for owner - not owner", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.reward_for_owner(10000000000000, { from: accounts[1], gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Need owner permission") > 0);
  });

  it("Reward for owner - not enought coins", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.reward_for_owner(100000000000000, { from: accounts[0], gasPrice: 1000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Not enought coins") > 0);
  });

  it("Reward for owner success", async () => {
    let contract = await ChickBoom.deployed();
    let balance_before_output;
    await web3.eth.getBalance(accounts[0])
      .then(balance => {
        balance_before_output = balance;
      })
      .then(() => {
        return contract.reward_for_owner(10000000000000, { from: accounts[0], gasPrice: 100000000 })
      })
      .then(() => web3.eth.getBalance(accounts[0]))
      .then(balance => assert.ok(balance > balance_before_output))
  });

  it("Get cush failure - not cush", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.get_cush(0, { from: accounts[0], gasPrice: 1000000000})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);

    await contract.get_cush(1, { from: accounts[1], gasPrice: 1000000000})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);

    await contract.get_cush(2, { from: accounts[2], gasPrice: 1000000000})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);
  });
});

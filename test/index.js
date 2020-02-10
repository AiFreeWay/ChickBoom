const DeployedAddresses = require("truffle")["DeployedAddresses"];
const ChickBoom = artifacts.require("ChickBoom");

contract("ChickBoom", async accounts => {
  //!!! Default ChickBoom creates with 3 ticket and 10000000000000 ticket price

  it("Credit contract", async () => {
    let contract = await ChickBoom.deployed();
    contract.sendTransaction({from: accounts[0], value:1000000000000000})
  });

  //BUY TICKET FAILURE - SELLING NOT STARTED

  it("Buy ticket failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.buy_ticket({ from: accounts[1], value: 10000000000000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Lottery not started now") > 0);
  });

  //REWARD FAILURE - SELLING NOT STARTED

  it("Reward failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.reward({ from: accounts[1]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Lottery not started now") > 0);
  });

  //LETS WIN FAILURE - SELLING NOT STARTED

  it("Lets winn failure - lottery not started", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.lets_win({ from: accounts[0]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Lottery not started now") > 0);
  });

  //START SELLING

  it("Start selling failure - not owner", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.start_selling({ from: accounts[1]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Need owner permission") > 0);
  });

  it("Start selling success", async () => {
    let contract = await ChickBoom.deployed();
    let lottery_state;
    await contract.start_selling({ from: accounts[0]})
      .then(() => contract.get_lottery_state({ from: accounts[1]}))
      .then(state => { lottery_state = state; });
    assert.equal(lottery_state, 1);
  });

  //BUY TICKET FAILURE - NOT ENOUGHT COINS

  it("Buy ticket failure - Not enought amount", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.buy_ticket({ from: accounts[1], value: 10000 })
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("Not enought amount") > 0);
  });

  //BUY TICKET SUCCESS

  it("Buy ticket success wallet 1", async () => {
    let contract = await ChickBoom.deployed();
    await contract.buy_ticket({ from: accounts[1], value: 10000000000000 })
      .catch(err => assert.ok(false));
  });

  //REWARD FAILURE - HAVE NOT TICKETS

  it("Reward failure - have not ticket", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.reward({ from: accounts[2]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not ticket") > 0);
  });

  //REWARD SUCCESS

  it("Reward success", async () => {
    let contract = await ChickBoom.deployed();
    await contract.reward({ from: accounts[1]})
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
    assert.ok(error.toString().indexOf("Tickets not solded") > 0);
  });

  //START LOTTERY

  it("Buy ticket success wallet 2", async () => {
    let contract = await ChickBoom.deployed();
    await contract.buy_ticket({ from: accounts[2], value: 10000000000000 })
      .catch(err => assert.ok(false));
  });

  it("Buy ticket success wallet 3 and finish lottery", async () => {
    let contract = await ChickBoom.deployed();
    let winner_address;
    let winner_balance_before_win;
    await contract.buy_ticket({ from: accounts[3], value: 10000000000000 })
      .then(() => contract.lets_win())
      .then(() => contract.get_lottery_state())
      .then(state => assert.equal(state, 0))
      .then(() => contract.getPastEvents('WinEvent', { fromBlock: 0, toBlock: 'latest' }))
      .then(events => {
        assert.equal(events[0].returnValues.cush, 30000000000000);
        assert.equal(events[0].returnValues.round, 1);
        winner_address = events[0].returnValues.winner;
      })
      .then(() => web3.eth.getBalance(winner_address))
      .then(balance => {
        winner_balance_before_win = balance;
      })
      .then(() => {
        return contract.get_cush(1, { from: winner_address})
      })
      .then(() => web3.eth.getBalance(winner_address))
      .then(balance => {
        assert.ok(balance > winner_balance_before_win);
      })
  });

  it("Get cush failure - not cush", async () => {
    let contract = await ChickBoom.deployed();
    let error;
    await contract.get_cush(0, { from: accounts[0]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);

    await contract.get_cush(1, { from: accounts[1]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);

    await contract.get_cush(2, { from: accounts[2]})
      .catch(err => { error = err });
    assert.ok(error.toString().indexOf("You have not cush") > 0);
  });
});

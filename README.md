## Solidity lottery smart contract
#### Description
This contract created for fair and transparent cryptocurrency lotteries organization.

Owner contract can:
1. Create many lotteries
2. Adjust the number of participants and ticket price
3. Withdraw his reward
4. Start lottery

Lottery participant can:
1. Buy ticket
2. Refound ticket
3. Get cush

Fully tested contract, you can see
[tests here](https://github.com/AiFreeWay/ChickBoom/blob/master/test/index.js)

Builded and tested with Solidity and Ethereum truffle.
Security analyzed with Mythx.

#### Installation guide
You need install <b>Nodejs</b> before
```
git clone https://github.com/AiFreeWay/ChickBoom
cd ChickBoom
npm install
truffle test test/index.js

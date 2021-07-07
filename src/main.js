const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('fa28a8d71cfafdd40260b0befbb631b4aded46363713cb5e5aaddab23588f61f');
const myWalletAddress = myKey.getPublic('hex');

let graemeCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
graemeCoin.addTransaction(tx1);

// In reality, "address1" and "address2" would be the public keys of someone's wallet(s)
// graemeCoin.createTransaction(new Transaction('address1', 'address2', 100));
// graemeCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
graemeCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of Graeme is: ', graemeCoin.getBalanceOfAddress(myWalletAddress));

// console.log('\n Starting the miner again...');
// graemeCoin.minePendingTransactions('graemes-address');

// console.log('\nBalance of Graeme is: ', graemeCoin.getBalanceOfAddress('graemes-address'));
// console.log(graemeCoin.pendingTransactions);
// console.log('blocks: ', graemeCoin.chain);

graemeCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid? ', graemeCoin.isChainValid());

// console.log('Mining block 1...');
// graemeCoin.addBlock(new Block(1, '01/07/2021', { amount: 4 }));

// console.log('Mining block 2...');
// graemeCoin.addBlock(new Block(2, '03/07/2021', { amount: 10 }));

// TESTING BLOCKCHAIN FIRST VIDEO
// console.log('Is blockchain valid? ' + graemeCoin.isChainValid());

// graemeCoin.chain[1].transactions = { amount: 100 };
// graemeCoin.chain[1].hash = graemeCoin.chain[1].calculateHash();

// console.log('Is blockchain valid? ' + graemeCoin.isChainValid());
// console.log(JSON.stringify(graemeCoin, null, 4));

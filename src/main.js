const { Blockchain, Transaction } = require('./blockchain');

let graemeCoin = new Blockchain();

// In reality, "address1" and "address2" would be the public keys of someone's wallet(s)
graemeCoin.createTransaction(new Transaction('address1', 'address2', 100));
graemeCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
graemeCoin.minePendingTransactions('graemes-address');

console.log('\nBalance of Graeme is: ', graemeCoin.getBalanceOfAddress('graemes-address'));

console.log('\n Starting the miner again...');
graemeCoin.minePendingTransactions('graemes-address');

console.log('\nBalance of Graeme is: ', graemeCoin.getBalanceOfAddress('graemes-address'));
console.log(graemeCoin.pendingTransactions);
console.log('blocks: ', graemeCoin.chain);

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

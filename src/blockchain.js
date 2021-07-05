const SHA256 = require('crypto-js/sha256');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}
}

class Block {
	constructor(timestamp, transactions, previousHash = '') {
		this.timestamp = timestamp;
		this.transactions = transactions;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		this.nonce = 0;
	}

	calculateHash() {
		return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
	}

	// mineBlock does the same as calculateHash, but implements proof-of-work before deciding on a final hash value
	mineBlock(difficulty) {
		// difficulty is the number of leading zeroes that the block hash must have in order to be mined
		while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
			// Without the nonce, the hash would be the same every time and this would become an endless loop
			this.nonce++;
			// incrementing the nonce each time the block is hashed results in a completely different/random hash
			this.hash = this.calculateHash();
			console.log('hash attempt: ' + this.nonce + ' ', this.hash);
		}

		console.log('Block mined: ' + this.hash);
	}
}

class Blockchain {
	constructor() {
		this.chain = [this.createGenesisBlock()];
		// difficulty for this blockchain is hardcoded to 2
		// in Bitcoin's case, the difficulty is adjusted in response to the average mining time of the network
		this.difficulty = 2;
		// transactions made in between blocks are temporarily stored in pending transactions array, so they can be included in the next block
		this.pendingTransactions = [];
		// Reward in # of coins for mining a new block:
		this.miningReward = 100;
	}

	createGenesisBlock() {
		return new Block('28/06/2021', 'Genesis block', '0');
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	// Old Method
	// addBlock(newBlock) {
	// 	newBlock.previousHash = this.getLatestBlock().hash;
	// 	// newBlock.hash = newBlock.calculateHash();

	// 	newBlock.mineBlock(this.difficulty);
	// 	this.chain.push(newBlock);
	// }

	// Create new block, add pending transactions to it, and reset pendingTransactions array
	// with transaction sending reward to miner's receiving address
	minePendingTransactions(miningRewardAddress) {
		// this code could be changed to give the miner more coins
		// However, in practice, the other nodes in the peer-to-peer network would ignore your illegitimate transaction
		let block = new Block(Date.now(), this.pendingTransactions);
		block.previousHash = this.getLatestBlock().hash;
		block.hash = block.calculateHash();
		block.mineBlock(this.difficulty);

		console.log('Block successfully mined!');
		this.chain.push(block);

		// because the reward is stored in pendingTransactions,
		// the miner does not actually receive the reward until the next block is mined
		this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
	}

	createTransaction(transaction) {
		this.pendingTransactions.push(transaction);
	}

	getBalanceOfAddress(address) {
		let balance = 0;

		for (const block of this.chain) {
			for (const trans of block.transactions) {
				if (trans.fromAddress === address) {
					balance -= trans.amount;
				}

				if (trans.toAddress === address) {
					balance += trans.amount;
				}
			}
		}

		return balance;
	}

	// verify integrity of blockchain
	isChainValid() {
		for (let i = 1; i < this.chain.length; i++) {
			const currentBlock = this.chain[i];
			const previousBlock = this.chain[i - 1];

			// check if current block's hash is valid
			if (currentBlock.hash !== currentBlock.calculateHash()) {
				return false;
			}

			// check if current block's "previousHash" value matches hash value of previous block
			if (currentBlock.previousHash !== previousBlock.hash) {
				return false;
			}
		}

		return true;
	}
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
	constructor(fromAddress, toAddress, amount) {
		this.fromAddress = fromAddress;
		this.toAddress = toAddress;
		this.amount = amount;
	}

	calculateHash() {
		return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
	}

	signTransaction(signingKey) {
		if (signingKey.getPublic('hex') !== this.fromAddress) {
			throw new Error('You cannot sign transactions for other wallets!');
		}

		const hashTx = this.calculateHash();
		const sig = signingKey.sign(hashTx, 'base64');
		this.signature = sig.toDER('hex');
	}

	isValid() {
		if (this.fromAddress === null) return true;

		if (!this.signature || this.signature.length === 0) {
			throw new Error('No signature in this transaction');
		}

		const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
		return publicKey.verify(this.calculateHash(), this.signature);
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

	hasValidTransactions() {
		for (const tx of this.transactions) {
			if (!tx.isValid()) {
				return false;
			}
		}

		return true;
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
		const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
		this.pendingTransactions.push(rewardTx);

		let block = new Block(Date.now(), this.pendingTransactions);
		block.previousHash = this.getLatestBlock().hash;
		block.hash = block.calculateHash();
		block.mineBlock(this.difficulty);

		console.log('Block successfully mined!');
		this.chain.push(block);
		this.pendingTransactions = [];

		// because the reward is stored in pendingTransactions,
		// the miner does not actually receive the reward until the next block is mined
		// this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
	}

	addTransaction(transaction) {
		if (!transaction.fromAddress || !transaction.toAddress) {
			throw new Error('Transaction must include from and to address');
		}

		if (!transaction.isValid()) {
			throw new Error('Cannot add invalid transaction to chain');
		}

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

			if (!currentBlock.hasValidTransactions()) {
				return false;
			}

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

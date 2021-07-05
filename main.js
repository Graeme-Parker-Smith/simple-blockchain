const SHA256 = require('crypto-js/sha256');

class Block {
	constructor(index, timestamp, data, previousHash = '') {
		this.index = index;
		this.timestamp = timestamp;
		this.data = data;
		this.previousHash = previousHash;
		this.hash = this.calculateHash();
		this.nonce = 0;
	}

	calculateHash() {
		return SHA256(
			this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce
		).toString();
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
		this.difficulty = 3;
	}

	createGenesisBlock() {
		return new Block(0, '28/06/2021', 'Genesis block', '0');
	}

	getLatestBlock() {
		return this.chain[this.chain.length - 1];
	}

	addBlock(newBlock) {
		newBlock.previousHash = this.getLatestBlock().hash;
		// newBlock.hash = newBlock.calculateHash();

		newBlock.mineBlock(this.difficulty);
		this.chain.push(newBlock);
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

let graemeCoin = new Blockchain();

console.log('Mining block 1...');
graemeCoin.addBlock(new Block(1, '01/07/2021', { amount: 4 }));

console.log('Mining block 2...');
graemeCoin.addBlock(new Block(2, '03/07/2021', { amount: 10 }));

// TESTING BLOCKCHAIN FIRST VIDEO
// console.log('Is blockchain valid? ' + graemeCoin.isChainValid());

// graemeCoin.chain[1].data = { amount: 100 };
// graemeCoin.chain[1].hash = graemeCoin.chain[1].calculateHash();

// console.log('Is blockchain valid? ' + graemeCoin.isChainValid());
// console.log(JSON.stringify(graemeCoin, null, 4));

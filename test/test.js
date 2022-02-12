const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// const miningPoolABI = (JSON.parse(fs.readFileSync('./artifacts/contracts/Mining/ERC20Mine.sol/ERC20MineV3.json', 'utf8'))).abi;
 

describe("Merkle tests", function () {
	const advanceBlock = () => new Promise((resolve, reject) => {
		web3.currentProvider.send({
			jsonrpc: '2.0',
			method: 'evm_mine',
			id: new Date().getTime()
		}, async (err, result) => {
			if (err) { return reject(err) }
			// const newBlockHash =await web3.eth.getBlock('latest').hash
			return resolve()
		})
	})
	
	const advanceBlocks = async (num) => {
		let resp = []
		for (let i = 0; i < num; i += 1) {
			resp.push(advanceBlock())
		}
		await Promise.all(resp)
	}

	before(async () => {
		MERKLE = await ethers.getContractFactory("MRKL");
		merkle = await MERKLE.deploy();	
		await merkle.deployed();

        // accounts = await web3.eth.getAccounts()
		accounts = await ethers.getSigners();
	})

	it ("should print addresses", async () => {
		console.log({
			merkle: merkle.address,
		})
	})

	it ("should add merkle proof", async () => {
		const merkleRootBef = await merkle.merkleRoot();
		await merkle.setMerkleRoot("0xc763bea85f3e4dc4a7b7ce233628bdc90dbadb417f181c38313ed51519c27f34");
		const merkleRootAft = await merkle.merkleRoot();
		console.log({
			merkleRootBef,
			merkleRootAft,
		})
	})

	it ("should set presale", async () => {
		const presaleBef = await merkle.isPresaleActive();
		await merkle.togglePresale();
		const presaleAft = await merkle.isPresaleActive();
		console.log({
			presaleBef,
			presaleAft,
		})
	})

	it ("should call presale mint", async () => {
		const proofs = ['0x10c7128db962c642123e71114b9e5a63ea84edc1fc800f8fdfaba68cfe8bcf74','0x6cc0f7d6d3d2c56bdb075ddc484f7ca75c0816605fd042593a930d1863bd3566']
		await merkle.preSaleMint(proofs, 1, { value: ethers.utils.parseEther('1') });
	})
});
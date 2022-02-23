const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const data = require("../data/data.csv")
const fs = require('fs');
const { parse } = require('csv-parse');
const express = require('express');
const router = express.Router();

let whitelistedAddresses=[];
let merkleTree;

fs.createReadStream("/Users/gurkaransahni/Projects/merkle_tree_whitelist/data/data.csv")
    .pipe(parse({delimiter: ':'}))
    .on('data', function(csvrow) {
        //do something with csvrow
        whitelistedAddresses.push(...csvrow);        
    })
    .on('end',async function() {
      //do something with whitelistedAddresses
      console.log(whitelistedAddresses);
      const { merkleTree, rootHash } = await merkleTreeCalculation(whitelistedAddresses)
      await merkleTreeProofGeneration(merkleTree, "0x096DABeFE2DE1DeAF8E40368918d7B171aAf911c")
    });

console.log({data})

const merkleTreeCalculation = (whitelistedAddresses) => {
    const leafNodes = whitelistedAddresses.map(address => keccak256(address));
    merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

    const rootHash = merkleTree.getRoot();
    console.log(merkleTree.toString())
    console.log(rootHash.toString('hex'))

    return { merkleTree, rootHash };
}

const merkleTreeProofGeneration = (merkleTree, userAddress) => {
    const claimingAddress = keccak256(userAddress);
    const hexProof = merkleTree.getHexProof(claimingAddress);

    console.log({
        address: whitelistedAddresses[2],
        hash: keccak256(whitelistedAddresses[2]).toString('hex'),
        claimingAddress: claimingAddress.toString('hex'),
        hexProof,
    })

    return { hexProof }
}

router.get('/calculateMerkleTree', async (req, res) => {
    console.log('THIS IS REQUEST QUERY', req.query);
    const { userAddress } = req.query
    try {
        const {merkleTree, rootHash} = await merkleTreeCalculation(whitelistedAddresses)
        res.status(200).json([{ data: rootHash }]);
    } catch(err) {
        res.status(404).json([{ err }]);
    }
});

router.get('/getProof', async (req, res) => {
    console.log('THIS IS REQUEST QUERY', req.query);
    const { userAddress } = req.query
    try {
        const {hexProof} = await merkleTreeProofGeneration(merkleTree, userAddress)
        res.status(200).json([{ data: hexProof }]);
    } catch(err) {
        console.log(err)
        res.status(404).json([{ err }]);
    }
});

module.exports = router;

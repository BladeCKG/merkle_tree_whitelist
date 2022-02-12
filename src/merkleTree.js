const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const fs = require('fs');
const { parse } = require('csv-parse');

var whitelistedAddresses=[];
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
// let whitelistedAddresses = [
//     "0x096DABeFE2DE1DeAF8E40368918d7B171aAf911c",
//     "0x51Bb0896bFBa11e2277323A5f3a6f54C506bFFF9",
//     "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
//     "0x4d1a3EDEFD6F14b5dbdF3F7da21b9536e8760292",
// ]
const merkleTreeCalculation = (whitelistedAddresses) => {
    const leafNodes = whitelistedAddresses.map(address => keccak256(address));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

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
}
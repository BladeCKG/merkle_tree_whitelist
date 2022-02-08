const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

let whitelistedAddresses = [
    "0x096DABeFE2DE1DeAF8E40368918d7B171aAf911c",
    "0x51Bb0896bFBa11e2277323A5f3a6f54C506bFFF9",
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    "0x4d1a3EDEFD6F14b5dbdF3F7da21b9536e8760292",
]

const leafNodes = whitelistedAddresses.map(address => keccak256(address));
const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });

const rootHash = merkleTree.getRoot();
console.log(merkleTree.toString())
console.log(rootHash.toString('hex'))

const claimingAddress = leafNodes[2];
const hexProof = merkleTree.getHexProof(claimingAddress);

console.log({
    address: whitelistedAddresses[2],
    hash: keccak256(whitelistedAddresses[2]).toString('hex'),
    claimingAddress: claimingAddress.toString('hex'),
    hexProof,
})
//SPDX-License-Identifier: Unlicense
/*
Test banner
*/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV2V3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@openzeppelin/contracts/utils/Strings.sol';


contract NFTAToken is ERC20, Ownable {
    using Strings for uint256;
    using SafeERC20 for ERC20;
    using SafeMath for uint256;
  uint256 public constant MAX_SUPPLY = 500;
  uint256 public constant PUBLIC_PRICE = 0.075 * 1e18;
  uint256 public constant PRESALE1_PRICE = 0.025 * 1e18;
  uint256 public constant PRESALE2_PRICE = 0.05 * 1e18;

  uint256 constant public PRESALE1_MIN_PAY_PRICE = 10 * 1e18;
  uint256 constant public PRESALE2_MIN_PAY_PRICE = 100 * 1e18;
  uint256 constant public PUBLICSALE_MIN_PAY_PRICE = 1000 * 1e18;

  bool public isPresale1Active = false;
  bool public isPresale2Active = false;
  bool public isPublicSaleActive = false;

  bytes32 public presale1_merkleRoot;
  bytes32 public presale2_merkleRoot;
  mapping(address => uint256) public presale1MintAmount;
  mapping(address => uint256) public presale2MintAmount;
  mapping(address => uint256) public publicMintAmount;

  mapping(address => address) public oraclePriceFeed;

  modifier allowedPayToken(address payToken) {
    require(oraclePriceFeed[payToken] != address(0), "Not Allowed PayToken");
    _;
  }

  constructor() ERC20("NFT Apparel Token", "NFTA") {}

  function setPayToken(address token, address priceFeed) onlyOwner external {
    oraclePriceFeed[token] = priceFeed;
  }

  function payTokenPrice(address token) public view returns(uint256 value) {
    if(oraclePriceFeed[token] == address(0))
    {
      return 0;
    }
    value = uint256(AggregatorInterface(oraclePriceFeed[token]).latestAnswer());
    uint8 decimals = AggregatorV3Interface(oraclePriceFeed[token]).decimals();
    if(decimals < 18) {
      value = value.mul(10**(18 - decimals));
    }
  }

  function preSale1Mint(bytes32[] calldata _proof, address payToken, uint256 payAmount)
    external
    allowedPayToken(payToken)
  {
    require(msg.sender == tx.origin, "Can't mint through another contract");
    require(isPresale1Active, "Presale1 not active");

    bytes32 node = keccak256(abi.encodePacked(msg.sender));
    require(MerkleProof.verify(_proof, presale1_merkleRoot, node), "Not on allow list");
    // require(nMints <= MAX_MINTS, "Exceeds max token purchase");
    uint256 price = payTokenPrice(payToken);

    uint256 totalPayPrice = payAmount.mul(price);
    require(totalPayPrice >= PRESALE1_MIN_PAY_PRICE, string(abi.encodePacked("Minimum Pay Price of Presale1 is ", PRESALE1_MIN_PAY_PRICE.div(1e18),"$")));

    uint256 nMints = totalPayPrice.div(PRESALE1_PRICE);
    require(totalSupply().add(nMints) <= MAX_SUPPLY, "Mint exceeds total supply");

    // Keep track of mints for each address
    if (presale1MintAmount[msg.sender] > 0) {
      presale1MintAmount[msg.sender] = presale1MintAmount[msg.sender] + nMints;
    } else {
      presale1MintAmount[msg.sender] = nMints;
    }

    _mint(msg.sender, nMints);
  }

  function preSale2Mint(bytes32[] calldata _proof, address payToken, uint256 payAmount)
    external
    allowedPayToken(payToken)
  {
    require(msg.sender == tx.origin, "Can't mint through another contract");
    require(isPresale2Active, "Presale2 not active");

    bytes32 node = keccak256(abi.encodePacked(msg.sender));
    require(MerkleProof.verify(_proof, presale2_merkleRoot, node), "Not on allow list");
    // require(nMints <= MAX_MINTS, "Exceeds max token purchase");
    uint256 price = payTokenPrice(payToken);

    uint256 totalPayPrice = payAmount.mul(price);
    require(totalPayPrice >= PRESALE2_MIN_PAY_PRICE, string(abi.encodePacked("Minimum Pay Price of Presale2 is ", PRESALE2_MIN_PAY_PRICE.div(1e18),"$")));

    uint256 nMints = totalPayPrice.div(PRESALE2_PRICE);
    require(totalSupply().add(nMints) <= MAX_SUPPLY, "Mint exceeds total supply");

    // Keep track of mints for each address
    if (presale2MintAmount[msg.sender] > 0) {
      presale2MintAmount[msg.sender] = presale2MintAmount[msg.sender] + nMints;
    } else {
      presale2MintAmount[msg.sender] = nMints;
    }

    _mint(msg.sender, nMints);
  }

  function publicPurchase(address payToken, uint256 payAmount)
    external
    allowedPayToken(payToken)
  {
    require(msg.sender == tx.origin, "Can't mint through another contract");
    require(isPublicSaleActive, "Presale not active");

    uint256 price = payTokenPrice(payToken);

    uint256 totalPayPrice = payAmount.mul(price);
    require(totalPayPrice >= PUBLICSALE_MIN_PAY_PRICE, string(abi.encodePacked("Minimum Pay Price of Presale2 is ", PUBLICSALE_MIN_PAY_PRICE.div(1e18),"$")));

    uint256 nMints = totalPayPrice.div(PUBLIC_PRICE);
    require(totalSupply().add(nMints) <= MAX_SUPPLY, "Mint exceeds total supply");

    // Keep track of mints for each address
    if (publicMintAmount[msg.sender] > 0) {
      publicMintAmount[msg.sender] = publicMintAmount[msg.sender] + nMints;
    } else {
      publicMintAmount[msg.sender] = nMints;
    }

    _mint(msg.sender, nMints);
  }

  function withdrawAll(address token) external onlyOwner {
    uint256 tokenBalance = ERC20(token).balanceOf(address(this));
    require(tokenBalance > 0, "No tokens to withdraw");
    ERC20(token).safeTransfer(msg.sender, tokenBalance);
  }

  function reserveMint(address treasury, uint256 nMints) external onlyOwner {
    require(totalSupply().add(nMints) <= MAX_SUPPLY, "Mint exceeds total supply");

    _mint(treasury, nMints);
  }

  function setPresale1_merkleRoot(bytes32 _presale1_merkleRoot) external onlyOwner {
    presale1_merkleRoot = _presale1_merkleRoot;
  }

  function setPresale2_merkleRoot(bytes32 _presale2_merkleRoot) external onlyOwner {
    presale2_merkleRoot = _presale2_merkleRoot;
  }

  function togglePresale1() external onlyOwner {
    isPresale1Active = !isPresale1Active;
  }

  function togglePresale2() external onlyOwner {
    isPresale2Active = !isPresale2Active;
  }

  function togglePublicSale() external onlyOwner {
    isPublicSaleActive = !isPublicSaleActive;
  }

  receive() external payable {}
}
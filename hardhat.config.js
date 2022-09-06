require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

function getPrivateKey(networkName) {
    if (networkName) {
      const privateKey = process.env['PRIVATEKEY_' + networkName.toUpperCase()]
      if (privateKey && privateKey !== '') {
        return privateKey
      }
    }
  
    const privateKey = process.env.PRIVATEKEY
    if (!privateKey || privateKey === '') {
      return '0'
    }
  
    return privateKey
  }
  
  function getAPIKey(networkName) {
    if (networkName) {
      const privateKey = process.env['APIKEY_' + networkName.toUpperCase()]
      if (privateKey && privateKey !== '') {
        return privateKey
      }
    }
  
    const privateKey = process.env.APIKEY
    if (!privateKey || privateKey === '') {
      return '0'
    }
  
    return privateKey
  }
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
            {
                version: "0.8.1",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000,
                    },
                },
            },
        ],
    },
    spdxLicenseIdentifier: {
        overwrite: true,
        runOnCompile: true,
    },
    defaultNetwork: "hardhat",
    mocha: {
        timeout: 1000000000000,
    },

    networks: {
        hardhat: {
            blockGasLimit: 10000000000000,
            allowUnlimitedContractSize: true,
            timeout: 1000000000000,
            accounts: {
                accountsBalance: "100000000000000000000000",
                count: 20,
            },
        },
        bscTestnet: {
            url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
            accounts: [getPrivateKey('bsctestnet')],
            gasPrice: 30000000000,
        },
        rinkeby: {
            url: "https://rinkeby.infura.io/v3/ad9cef41c9c844a7b54d10be24d416e5",
            accounts: [getPrivateKey('rinkeby')],
            // gasPrice: 30000000000,
        },
        kovan: {
            url: "https://kovan.infura.io/v3/ad9cef41c9c844a7b54d10be24d416e5",
            accounts: [getPrivateKey('kovan')],
            // gasPrice: 30000000000,
        },
    },

    contractSizer: {
        alphaSort: false,
        runOnCompile: true,
        disambiguatePaths: false,
    },
    etherscan: {
        apiKey: `${getAPIKey('ethereum')}`
    }
};

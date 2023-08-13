require("@nomicfoundation/hardhat-toolbox");

// require("@nomiclabs/hardhat-waffle");
// require("@nomiclabs/hardhat-etherscan");

let secretOptimismgoerli = require("/Users/saar/Desktop/Development/FrensOnChain/sc-optimism.json");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    optimismgoerli: {
      url: secretOptimismgoerli.url,
      accounts: [secretOptimismgoerli.key],
      gasPrice: 30000000,
    },
  },
};


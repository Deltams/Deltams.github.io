require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      {
        version: "0.6.6",
        settings: {
          evmVersion: "istanbul",
        },
      },
    ],
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 100000,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337, // default is 31337
      forking: {
        url: process.env.INFURA_MAINNET_ENDPOINT_M,
        timeout : 20000000000000000000000000,
        initialBaseFeePerGas: 0,
        gasPrice: 5000000000,
      },
    },
  },
  mocha: {
    timeout: 2000000000000, // 200 seconds max for running tests
  },
};
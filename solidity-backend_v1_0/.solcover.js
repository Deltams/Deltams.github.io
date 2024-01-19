module.exports = {
  skipFiles: [
    "TWETH.sol",
    "TUSDC.sol",
    "Lock.sol",
    "DeltamsToken.sol",
    "SwapContractTest.sol",
  ],
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

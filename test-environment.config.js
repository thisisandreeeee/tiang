module.exports = {
  accounts: {
    amount: 10, // Number of unlocked accounts
    ether: 100, // Initial balance of unlocked accounts (in ether)
  },

  contracts: {
    type: 'truffle', // Contract abstraction to use: 'truffle' for @truffle/contract or 'web3' for web3-eth-contract
    defaultGas: 6e7, // Maximum gas for contract calls (when unspecified)
    artifactsDir: 'app/src/contracts', // Directory where contract artifacts are stored
  },

  node: { // Options passed directly to Ganache client
    gasLimit: 8e7, // Maximum gas per block
    gasPrice: 20e9, // Sets the default gas price for transactions if not otherwise specified.
  },

};


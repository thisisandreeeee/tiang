import Web3 from "web3";
import Dealer from "./contracts/Dealer.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [Dealer],
};

export default options;

import Web3 from "web3";
import InBetween from "./contracts/InBetween.json";

const options = {
  web3: {
    block: false,
    customProvider: new Web3("ws://localhost:8545"),
  },
  contracts: [InBetween],
};

export default options;

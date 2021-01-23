// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Pot.sol";

contract InBetween is Ownable {
    Pot pot;
    uint256 ante;

    constructor() {
        pot = new Pot();
        ante = 0.01 ether;
    }

    function joinGame() external payable {
        require(pot.depositsOf(msg.sender) == 0, "Player is already in game");
        require(msg.value >= ante, "Sent amount less than ante");

        pot.deposit(msg.sender);

        // give cards and put player in queue
    }
}

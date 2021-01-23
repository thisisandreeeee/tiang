// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Pot.sol";

contract InBetween is Ownable {
    Pot pot;
    uint256 ante;

    constructor(uint256 _anteInWei) {
        pot = new Pot();
        ante = _anteInWei;
    }

    function joinGame() external payable {
        require(pot.depositsOf(msg.sender) == 0, "Player is already in game");
        require(msg.value >= ante, "Sent amount less than ante");

        pot.deposit(msg.sender);

        // give cards

        // put player in queue
        // https://ethereum.stackexchange.com/questions/63708/how-to-properly-delete-the-first-element-in-an-array
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = pot.depositsOf(msg.sender);
        require(stake >= 0, "Player is not in game");
        return stake;
    }
}

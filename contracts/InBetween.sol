// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InBetween is Ownable {
    uint256 ante = 100 wei; // TODO: make this configurable

    mapping(address => uint256) private _bets;

    function joinGame() external payable {
        require(_bets[msg.sender] == 0, "player is already in game");
        require(msg.value >= ante, "sent amount less than ante");

        // TODO: check whether this is net of gas fee
        _bets[msg.sender] += msg.value;
        // TODO: refund excess ante

        // draw 2 pseudorandom cards

        // put player in queue
        // https://ethereum.stackexchange.com/questions/63708/how-to-properly-delete-the-first-element-in-an-array
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = _bets[msg.sender];
        require(stake > 0, "player must be in game to view stake");
        return stake;
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Queue.sol";

contract InBetween is Ownable {
    using Queue for Queue.Data;
    using SafeMath for uint256;

    uint256 private ante = 100 wei; // TODO: make this configurable
    uint256 private pot;

    mapping(address => uint256) private balances;
    mapping(address => uint8[3]) private hands;

    Queue.Data private queue;

    function joinGame() external payable {
        require(balances[msg.sender] == 0, "player is already in game");
        require(msg.value >= ante, "sent amount less than ante");

        balances[msg.sender] = balances[msg.sender].add(msg.value);
        pot = pot.add(msg.value);

        drawOpeningCards();

        queue.push(msg.sender);
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = balances[msg.sender];
        require(stake > 0, "player must be in game to view stake");
        return stake;
    }

    function bet() external payable {
        require(queue.peek() == msg.sender, "player is not next in queue");
        require(msg.value >= 2 * pot, "sent amount less than half of pot");
        drawFinalCard();

        (uint8 lower, uint8 upper) = lowerUpperCards();
        uint8 last = hands[msg.sender][2];

        // TODO: implement payment without re-entrancy risk
        // maybe use an escrow here?
        if (lower < last && last < upper) {
            // player wins the bet
        } else if (lower == last || last == upper) {
            // player pays double the bet
        } else {
            // player loses the bet
        }
    }

    function drawOpeningCards() private {
        require(
            hands[msg.sender].length == 0,
            "player already has opening cards"
        );
        hands[msg.sender][0] = randomNumber();
        hands[msg.sender][1] = randomNumber();
    }

    function drawFinalCard() private {
        require(
            hands[msg.sender].length == 2,
            "player does not have opening cards"
        );
        hands[msg.sender][2] = randomNumber();
    }

    function randomNumber() private view returns (uint8) {
        // not truly random, need to use oracle as RNG
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        rand = rand**2;
        return uint8(rand.mod(13));
    }

    function lowerUpperCards() private view returns (uint8, uint8) {
        uint8 c1 = hands[msg.sender][0];
        uint8 c2 = hands[msg.sender][1];
        if (c1 < c2) {
            return (c1, c2);
        } else {
            return (c2, c1);
        }
    }
}

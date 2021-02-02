// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./Queue.sol";
import "./Cards.sol";

contract InBetween is Ownable {
    using Cards for Cards.Data;
    using SafeMath for uint256;

    uint256 private ante;

    uint256 private pot;
    struct Player {
        uint256 balance;
        Cards.Data cards;
    }
    mapping(address => Player) private players;
    Queue private queue;

    constructor() {
        ante = 100 wei;
        queue = new Queue();
    }

    function joinGame() external payable {
        uint256 balance = players[msg.sender].balance;
        require(balance == 0, "player is already in game");
        require(msg.value >= ante, "sent amount less than ante");

        // TODO: refund excess ante
        players[msg.sender].balance = balance.add(msg.value);
        pot = pot.add(msg.value);

        players[msg.sender].cards = players[msg.sender].cards.setOpeningCards(
            randomNumber(),
            randomNumber()
        );

        queue.push(msg.sender);
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = players[msg.sender].balance;
        require(stake > 0, "player not in game");
        return stake;
    }

    function viewCards() external view returns (Cards.Data memory) {
        require(players[msg.sender].balance > 0, "player not in game");
        return players[msg.sender].cards;
    }

    function bet() external payable {
        require(queue.head() == msg.sender, "player is not next in queue");
        require(msg.value >= 2 * pot, "sent amount less than half of pot");

        require(
            hands[msg.sender].hasOpeningCards(),
            "player does not have opening cards"
        );
        hands[msg.sender] = hands[msg.sender].setFinalCard(randomNumber());

        // TODO: implement payment without re-entrancy risk
        // maybe use an escrow here?
        if (hands[msg.sender].result() == Cards.Result.Inside) {
            // player wins the bet
        } else if (hands[msg.sender].result() == Cards.Result.Equal) {
            // player pays double the bet
        } else if (hands[msg.sender].result() == Cards.Result.Outside) {
            // player loses the bet
        } else {
            revert("unsupported card result");
        }
        // if game not over, add player to back of queue again
    }

    function randomNumber() private view returns (uint8) {
        // not truly random, need to use oracle as RNG
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        rand = rand**2;
        return uint8(rand.mod(13));
    }
}

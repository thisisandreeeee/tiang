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

    // TODO: configurations
    uint256 private ante = 100 wei;

    uint256 private pot;
    mapping(address => uint256) private balances;
    mapping(address => Cards.Data) private hands;
    Queue private queue;

    constructor() {
        queue = new Queue();
    }

    function joinGame() external payable {
        require(balances[msg.sender] == 0, "player is already in game");
        require(msg.value >= ante, "sent amount less than ante");

        // TODO: refund excess ante
        balances[msg.sender] = balances[msg.sender].add(msg.value);
        pot = pot.add(msg.value);

        hands[msg.sender] = hands[msg.sender].setOpeningCards(
            randomNumber(),
            randomNumber()
        );

        queue.push(msg.sender);
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = balances[msg.sender];
        require(stake > 0, "player not in game");
        return stake;
    }

    function viewHand() external view returns (Cards.Data memory) {
        require(balances[msg.sender] > 0, "player not in game");
        return hands[msg.sender];
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

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";

import "./Queue.sol";
import "./Cards.sol";
import "./Cashier.sol";

contract InBetween is Ownable, Cashier {
    using Cards for Cards.Data;
    using SafeMath for uint256;

    uint256 public ante;
    uint256 public pot;
    mapping(address => Cards.Data) private cards;
    Queue internal queue;

    constructor() {
        ante = 100 wei;
        queue = new Queue();
    }

    function joinGame() external {
        // TODO: check if player is already in game
        require(balanceOf(msg.sender) >= ante, "balance less than ante");

        deduct(msg.sender, ante);
        pot = pot.add(ante);

        cards[msg.sender] = cards[msg.sender].setOpeningCards(
            randomNumber(0),
            randomNumber(1)
        );

        queue.push(msg.sender);
    }

    function viewCards() external view returns (Cards.Data memory) {
        return cards[msg.sender];
    }

    function viewResult() external view returns (Cards.Result) {
        return cards[msg.sender].result();
    }

    function nextPlayer() external view returns (address) {
        if (queue.length() == 0) return address(0);
        return queue.head();
    }

    // ONLY FOR TESTING PURPOSES
    function reset(bool hard) external {
        delete cards[msg.sender];
        if (hard) {
            withdraw(msg.sender);
            pot = 0;
        }
    }

    function bet(uint256 _betAmount) external {
        // TODO: implement queue time limit
        require(queue.head() == msg.sender, "player is not next in queue");

        _betAmount = Math.min(_betAmount, pot);
        if (pot >= ante) {
            require(_betAmount >= ante, "bet must not be less than ante");
        }
        require(
            balanceOf(msg.sender) >= _betAmount.mul(2),
            "balance less than 2x of bet amount"
        );

        require(
            cards[msg.sender].hasOpeningCards(),
            "player does not have opening cards"
        );
        cards[msg.sender] = cards[msg.sender].setFinalCard(randomNumber(2));
        queue.pop();

        Cards.Result result = cards[msg.sender].result();
        if (result == Cards.Result.Inside) {
            deposit(msg.sender, _betAmount);
            pot = pot.sub(_betAmount);
        } else if (result == Cards.Result.Equal) {
            deduct(msg.sender, _betAmount.mul(2));
            pot = pot.add(_betAmount.mul(2));
        } else if (result == Cards.Result.Outside) {
            deduct(msg.sender, _betAmount);
            pot = pot.add(_betAmount);
        } else {
            revert("unsupported card result");
        }

        // TODO: check if game is over before adding player to queue
        // maybe end game if pot is too small?

        // TODO: reset hand when rejoining game
        queue.push(msg.sender);
    }

    function randomNumber(uint256 cursor)
        internal
        view
        virtual
        returns (uint8)
    {
        // not truly random, need to use oracle as RNG
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        rand = rand.add(rand.mod(1000).mul(cursor)); // hack to allow mocking the RNG in tests
        return uint8(rand.mod(13));
    }
}

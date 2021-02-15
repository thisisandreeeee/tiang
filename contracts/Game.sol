// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Cards.sol";
import "./Cashier.sol";
import "./Queue.sol";

contract Game is Ownable {
    using Cards for Cards.Data;
    using SafeMath for uint256;
    using SafeCast for uint256;

    uint256 public ante;
    uint256 public pot;
    Queue internal queue;
    bool public ended;

    struct Player {
        Cards.Data cards;
        uint256 contributions;
    }
    mapping(address => Player) internal players;

    constructor() {
        ante = 100 wei;
        queue = new FifoQueue();
        ended = false;
    }

    function dealOpeningCards(address _player) external onlyOwner {
        require(!ended, "game is over");
        require(
            !players[_player].cards.hasOpeningCards(),
            "player already has opening cards"
        );
        if (players[_player].contributions < ante) {
            // TODO: test rejoin logic
            pot = pot.add(ante);
            players[_player].contributions += ante;
        }
        players[_player].cards = players[_player].cards.drawOpeningCards(
            randomNumber(0),
            randomNumber(1)
        );
        queue.push(_player);
    }

    function nextPlayer() external view returns (address) {
        if (queue.length() == 0 || ended) return address(0);
        return queue.head();
    }

    function dealFinalCard(address _player, uint256 _betAmount)
        external
        onlyOwner
        returns (uint256)
    {
        require(!ended, "game is over");
        // TODO: implement queue time limit
        require(queue.head() == _player, "player is not next in queue");

        require(
            players[_player].cards.hasOpeningCards(),
            "player does not have opening cards"
        );
        players[_player].cards = players[_player].cards.drawFinalCard(
            randomNumber(2)
        );
        queue.pop();

        uint256 winnings;
        Cards.Result result = players[_player].cards.result();
        if (result == Cards.Result.Inside) {
            winnings = _betAmount;
        } else if (result == Cards.Result.Equal) {
            winnings = -_betAmount.mul(2);
        } else if (result == Cards.Result.Outside) {
            winnings = -_betAmount;
        } else {
            revert("unsupported card result");
        }
        pot = pot.sub(winnings);
        players[_player].contributions -= winnings;
        if (pot == 0) ended = true;
        delete players[_player].cards;
        return winnings;
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

    function reset() external onlyOwner {
        pot = 0;
        queue = new FifoQueue();
        ended = false;
    }
}

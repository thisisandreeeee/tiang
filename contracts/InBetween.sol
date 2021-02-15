// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Queue.sol";
import "./Cards.sol";
import "./Cashier.sol";

contract InBetween is Cashier, Ownable {
    using Cards for Cards.Data;
    using SafeMath for uint256;

    uint256 public ante;
    uint256 public pot;
    Queue internal queue;
    bool public ended;
    uint256 rounds;

    struct Player {
        uint256 stake;
        Cards.Data cards;
    }

    mapping(address => Player) private players;

    constructor() {
        ante = 100 wei;
        setup();
    }

    modifier gameNotEnded() {
        require(!ended, "game is over");
        _;
    }

    function setup() public onlyOwner {
        queue = new FifoQueue();
        ended = false;
        pot = 0;
    }

    function join() external gameNotEnded {
        require(balanceOf(msg.sender) >= ante, "balance less than ante");
        deduct(msg.sender, ante);
        if (players[msg.sender].stake < ante) {
            pot = pot.add(ante);
            players[msg.sender].stake += ante;
        }
        dealOpeningCards(msg.sender);
    }

    function dealOpeningCards(address _player) internal {
        require(
            !players[_player].cards.hasOpeningCards(),
            "already has opening cards"
        );
        // TODO: rename set opening cards
        players[_player].cards = players[_player].cards.drawOpeningCards(
            randomNumber(0),
            randomNumber(1)
        );
        queue.push(_player);
    }

    function cards() external view returns (Cards.Data memory) {
        return players[msg.sender].cards;
    }

    function nextPlayer() external view returns (address) {
        if (queue.length() == 0 || ended) return address(0);
        return queue.head();
    }

    function bet(uint256 _betAmount) external gameNotEnded {
        _betAmount = Math.min(_betAmount, pot);
        if (pot >= ante) require(_betAmount >= ante, "must bet more than ante");
        require(
            balanceOf(msg.sender) >= _betAmount.mul(2),
            "balance must be >2x of bet"
        );

        uint256 winnings = dealFinalCard(msg.sender, _betAmount);
        if (winnings > 0) {
            deposit(msg.sender, winnings);
        } else if (winnings < 0) {
            deduct(msg.sender, -winnings);
        }

        if (!ended) dealOpeningCards(msg.sender);
    }

    function dealFinalCard(address _player, uint256 _betAmount)
        internal
        gameNotEnded
        returns (uint256)
    {
        // TODO: implement queue time limit
        require(queue.head() == _player, "player is not next in queue");

        require(players[_player].cards.hasOpeningCards(), "no opening cards");
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
        players[_player].stake -= winnings;
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
}

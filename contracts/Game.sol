// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/proxy/Initializable.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Queue.sol";
import "./Cards.sol";

contract Game is Initializable {
    using Cards for Cards.Data;
    using SafeMath for uint256;
    using SafeCast for uint256;

    uint256 public id;
    uint256 public ante;
    bool public ended;
    uint256 public pot;

    struct Player {
        bool inGame;
        Cards.Data cards;
    }
    mapping(address => Player) private players;
    Queue internal queue;

    function init(uint256 _id, uint256 _ante) public initializer {
        id = _id;
        ante = _ante;
        ended = false;
        queue = new FifoQueue();
    }

    function sitDown(address _player) external {
        require(!ended, "game is over");
        require(!players[_player].inGame, "player is already in game");

        pot = pot.add(ante);
        players[_player].inGame = true;
    }

    function dealOpeningCards(address _player) external {
        require(!ended, "game is over");
        require(inGame(_player), "player is not in game");
        if (cards(_player).hasOpeningCards() && cards(_player).hasFinalCard()) {
            delete players[_player].cards;
        }
        players[_player].cards = cards(_player).drawOpeningCards(
            randomNumber(0),
            randomNumber(1)
        );
        queue.push(_player);
    }

    function dealFinalCard(address _player, uint256 _bet)
        external
        returns (uint256, bool)
    {
        require(!ended, "game is over");
        require(inGame(_player), "player is not in game");
        require(
            cards(_player).hasOpeningCards(),
            "player does not have opening cards"
        );
        require(isNext(_player), "player is not next in queue");
        players[_player].cards = cards(_player).drawFinalCard(randomNumber(2));
        queue.pop();

        bool win;
        Cards.Result result = cards(_player).result();
        if (result == Cards.Result.Inside) {
            win = true;
            pot = pot.sub(_bet);
            if (pot == 0) ended = true;
        } else if (result == Cards.Result.Equal) {
            win = false;
            _bet = _bet.mul(2);
            pot = pot.add(_bet);
        } else if (result == Cards.Result.Outside) {
            win = false;
            pot = pot.add(_bet);
        } else {
            revert("unsupported card result");
        }
        delete players[_player].cards;
        return (_bet, win);
    }

    function isNext(address _player) public view returns (bool) {
        address next = nextPlayer();
        if (next == address(0)) return false;
        return next == _player;
    }

    function nextPlayer() public view returns (address) {
        if (queue.length() == 0 || ended) return address(0);
        return queue.head();
    }

    function cards(address _player) public view returns (Cards.Data memory) {
        return players[_player].cards;
    }

    function inGame(address _player) public view returns (bool) {
        return players[_player].inGame;
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

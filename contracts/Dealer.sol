// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Cashier.sol";
import "./Game.sol";

contract Dealer is Ownable, Cashier {
    using SafeMath for uint256;

    address[] public games;
    address internal gameContract;

    constructor() {
        Game game = new Game();
        gameContract = address(game);
    }

    function newGame(uint256 ante) public onlyOwner returns (address) {
        uint256 gameId = games.length;
        bytes32 salt = bytes32(gameId);
        address game = Clones.cloneDeterministic(gameContract, salt);
        Game(game).init(gameId, ante);
        games.push(game);
        return game;
    }

    function join(uint256 gameId) external {
        Game game = getGame(gameId);
        require(!game.ended(), "game is over");

        uint256 ante = game.ante();
        require(balanceOf(msg.sender) >= ante, "balance less than ante");

        deduct(msg.sender, ante);
        game.dealOpeningCards(msg.sender);
    }

    function bet(uint256 gameId, uint256 betValue) external {
        Game game = getGame(gameId);
        require(!game.ended(), "game is over");

        uint256 ante = game.ante();
        uint256 pot = game.pot();
        betValue = Math.min(betValue, pot);
        if (pot >= ante) {
            require(betValue >= ante, "bet must not be less than ante");
        }
        require(
            balanceOf(msg.sender) >= betValue.mul(2),
            "balance less than 2x of bet amount"
        );

        (uint256 payout, bool win) = game.dealFinalCard(msg.sender, betValue);
        if (win && payout > 0) {
            deposit(msg.sender, payout);
        } else if (!win && payout > 0) {
            deduct(msg.sender, payout);
        }

        if (!game.ended()) game.dealOpeningCards(msg.sender);
    }

    function getGame(uint256 gameId) internal view returns (Game) {
        return Game(games[gameId]);
    }
}

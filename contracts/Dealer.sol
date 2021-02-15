// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./Cashier.sol";
import "./Game.sol";

contract Dealer is Ownable, Cashier {
    using SafeMath for uint256;

    Game game;

    constructor() {
        game = new Game();
    }

    function join() external {
        require(balanceOf(msg.sender) >= game.ante(), "balance less than ante");
        deduct(msg.sender, game.ante());
        game.dealOpeningCards(msg.sender);
    }

    function bet(uint256 _bet) external {
        _bet = Math.min(_bet, game.pot());
        if (game.pot() >= game.ante()) {
            require(_bet >= game.ante(), "bet must not be less than ante");
        }
        require(
            balanceOf(msg.sender) >= _bet.mul(2),
            "balance less than 2x of bet amount"
        );

        uint256 winnings = game.dealFinalCard(msg.sender, _bet);
        if (winnings > 0) {
            deposit(msg.sender, winnings);
        } else if (winnings < 0) {
            deduct(msg.sender, winnings);
        }

        if (!game.ended()) game.dealOpeningCards(msg.sender);
    }

    function nextPlayer() external view returns (address) {
        return game.nextPlayer();
    }
}

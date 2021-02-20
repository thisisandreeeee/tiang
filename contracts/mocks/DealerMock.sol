// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "../Dealer.sol";
import "./GameMock.sol";

contract DealerMock is Dealer {
    constructor() {
        GameMock game = new GameMock();
        gameContract = address(game);
    }
}

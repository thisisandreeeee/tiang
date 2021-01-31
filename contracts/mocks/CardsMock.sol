// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "../Cards.sol";

contract CardsMock {
    function newCards() public pure returns (Cards.Data memory) {
        return Cards.Data(newCard(), newCard(), newCard());
    }

    function newCard() private pure returns (Cards.Card memory) {
        return Cards.Card(0, false);
    }

    function hasOpeningCards(Cards.Data memory _cards)
        public
        pure
        returns (bool)
    {
        return Cards.hasOpeningCards(_cards);
    }

    function setOpeningCards(
        Cards.Data memory _cards,
        uint8 value1,
        uint8 value2
    ) public pure returns (Cards.Data memory) {
        return Cards.setOpeningCards(_cards, value1, value2);
    }

    function hasFinalCard(Cards.Data memory _cards) public pure returns (bool) {
        return Cards.hasFinalCard(_cards);
    }

    function setFinalCard(Cards.Data memory _cards, uint8 value)
        public
        pure
        returns (Cards.Data memory)
    {
        return Cards.setFinalCard(_cards, value);
    }

    function result(Cards.Data memory _cards)
        public
        pure
        returns (Cards.Result)
    {
        return Cards.result(_cards);
    }
}

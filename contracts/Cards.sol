// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

import "@openzeppelin/contracts/math/Math.sol";

library Cards {
    enum Result {Unknown, Inside, Outside, Equal}
    struct Card {
        uint8 value;
        bool initialised;
    }
    struct Data {
        Card first;
        Card second;
        Card third;
    }

    function hasOpeningCards(Data memory _cards) internal pure returns (bool) {
        return _cards.first.initialised && _cards.second.initialised;
    }

    function drawOpeningCards(
        Data memory _cards,
        uint8 value1,
        uint8 value2
    ) internal pure returns (Data memory) {
        require(!hasOpeningCards(_cards), "already have opening cards");
        require(!hasFinalCard(_cards), "already have final card");
        require(inRange(value1), "value1 not in range [0,12]");
        require(inRange(value2), "value2 not in range [0,12]");
        _cards.first = Card({value: value1, initialised: true});
        _cards.second = Card({value: value2, initialised: true});
        return _cards;
    }

    function hasFinalCard(Data memory _cards) internal pure returns (bool) {
        return _cards.third.initialised;
    }

    function drawFinalCard(Data memory _cards, uint8 value)
        internal
        pure
        returns (Data memory)
    {
        require(hasOpeningCards(_cards), "must have opening cards");
        require(inRange(value), "value not in range [0,12]");
        require(!hasFinalCard(_cards), "already have final card");
        _cards.third = Card({value: value, initialised: true});
        return _cards;
    }

    function result(Data memory _cards) internal pure returns (Result) {
        if (!hasOpeningCards(_cards) || !hasFinalCard(_cards)) {
            return Result.Unknown;
        }

        uint8 lower = uint8(Math.min(_cards.first.value, _cards.second.value));
        uint8 upper = uint8(Math.max(_cards.first.value, _cards.second.value));

        if (lower < _cards.third.value && _cards.third.value < upper) {
            return Result.Inside;
        } else if (lower == _cards.third.value || upper == _cards.third.value) {
            return Result.Equal;
        } else {
            return Result.Outside;
        }
    }

    function inRange(uint8 value) private pure returns (bool) {
        return value >= 0 && value <= 13;
    }
}

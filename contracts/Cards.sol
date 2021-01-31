// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

library Cards {
    enum Result {Inside, Outside, Equal}
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

    function setOpeningCards(
        Data memory _cards,
        uint8 value1,
        uint8 value2
    ) internal pure returns (Data memory) {
        require(!hasOpeningCards(_cards), "opening cards already set");
        _cards.first = Card({value: value1, initialised: true});
        _cards.second = Card({value: value2, initialised: true});
        return _cards;
    }

    function hasFinalCard(Data memory _cards) internal pure returns (bool) {
        return _cards.third.initialised;
    }

    function setFinalCard(Data memory _cards, uint8 value)
        internal
        pure
        returns (Data memory)
    {
        require(!hasFinalCard(_cards), "final card already set");
        _cards.third = Card({value: value, initialised: true});
        return _cards;
    }

    function result(Data memory _cards) internal pure returns (Result) {
        require(hasOpeningCards(_cards), "opening cards not set");
        require(hasFinalCard(_cards), "final card not set");

        uint8 lower;
        uint8 upper;

        if (_cards.first.value < _cards.second.value) {
            lower = _cards.first.value;
            upper = _cards.second.value;
        } else {
            upper = _cards.first.value;
            lower = _cards.second.value;
        }

        if (lower < _cards.third.value && _cards.third.value > upper) {
            return Result.Inside;
        } else if (lower == _cards.third.value || upper == _cards.third.value) {
            return Result.Equal;
        } else {
            return Result.Outside;
        }
    }
}

// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "../InBetween.sol";

contract InBetweenMock is InBetween {
    uint8[3] randomNumbers;

    function setRandomNumbers(
        uint8 num1,
        uint8 num2,
        uint8 num3
    ) public {
        randomNumbers[0] = num1;
        randomNumbers[1] = num2;
        randomNumbers[2] = num3;
    }

    function randomNumber(uint256 cursor)
        internal
        view
        override
        returns (uint8)
    {
        assert(cursor <= 2); // only supports 3 random numbers
        uint8 value = randomNumbers[cursor];
        return value;
    }

    function skipNextPlayer() public {
        queue.pop();
    }
}

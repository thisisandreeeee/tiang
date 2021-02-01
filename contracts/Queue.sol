// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Queue {
    using SafeMath for uint128;
    using SafeCast for uint256;

    mapping(uint128 => address) private queue;
    uint128 private first = 0;
    uint128 private last = 0;

    modifier notEmpty {
        require(length() > 0, "queue cannot be empty");
        _;
    }

    function push(address data) public {
        // TODO: check for duplicates before push
        queue[last] = data;
        last = last.add(1).toUint128();
    }

    function pop() public notEmpty returns (address) {
        address data = queue[first];
        delete queue[first];
        first = first.add(1).toUint128();
        return data;
    }

    function head() public view notEmpty returns (address) {
        return queue[first];
    }

    function tail() public view notEmpty returns (address) {
        return queue[last - 1];
    }

    function length() public view returns (uint256) {
        return last - first;
    }
}

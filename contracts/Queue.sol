// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

interface Queue {
    function push(address data) external;

    function pop() external returns (address);

    function head() external view returns (address);

    function tail() external view returns (address);

    function length() external view returns (uint256);
}

contract FifoQueue is Queue {
    using SafeMath for uint128;
    using SafeCast for uint256;

    mapping(uint128 => address) private queue;
    uint128 private first = 0;
    uint128 private last = 0;

    modifier notEmpty {
        require(length() > 0, "queue cannot be empty");
        _;
    }

    function push(address data) public override {
        // TODO: check for duplicates before push
        queue[last] = data;
        last = last.add(1).toUint128();
    }

    function pop() public override notEmpty returns (address) {
        address data = queue[first];
        delete queue[first];
        first = first.add(1).toUint128();
        return data;
    }

    function head() public view override notEmpty returns (address) {
        return queue[first];
    }

    function tail() public view override notEmpty returns (address) {
        return queue[last - 1];
    }

    function length() public view override returns (uint256) {
        return last - first;
    }
}

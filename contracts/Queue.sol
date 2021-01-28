// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

library Queue {
    // https://ethereum.stackexchange.com/questions/63708/how-to-properly-delete-the-first-element-in-an-array
    struct Data {
        uint128 start;
        uint128 end;
        mapping(uint128 => address) addresses;
        mapping(address => uint128) positions;
    }

    function push(Data storage _queue, address _address) internal {
        _queue.addresses[_queue.end++] = _address;
        _queue.positions[_address] = _queue.end;
    }

    function pop(Data storage _queue) internal returns (address) {
        address _address = _queue.addresses[_queue.start];
        _queue.addresses[_queue.start++] = address(0);
        return _address;
    }

    function peek(Data storage _queue) internal view returns (address) {
        return _queue.addresses[_queue.start];
    }
}

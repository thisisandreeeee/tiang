// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Cashier {
    using SafeMath for uint256;
    using Address for address payable;

    mapping(address => uint256) private _balances;

    function topUp() public payable {
        deposit(msg.sender, msg.value);
    }

    function withdraw(address payable _address) public {
        uint256 total = _balances[_address];
        _balances[_address] = 0;
        _address.sendValue(total);
    }

    function balance(address _address) public view returns (uint256) {
        return _balances[_address];
    }

    function deposit(address _address, uint256 _amount) internal {
        require(_amount > 0, "amount must be positive");
        _balances[_address] = _balances[_address].add(_amount);
    }

    function deduct(address _address, uint256 _amount) internal {
        require(_amount > 0, "amount must be positive");
        uint256 total = _balances[_address];
        require(_amount <= total, "cannot deduct more than total");
        _balances[_address] = total - _amount;
    }
}

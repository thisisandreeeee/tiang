// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "../Cashier.sol";

contract CashierMock is Cashier {
    constructor() payable {}

    function contractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function callDeposit(address _address, uint256 _amount) public {
        deposit(_address, _amount);
    }

    function callDeduct(address _address, uint256 _amount) public {
        deduct(_address, _amount);
    }
}

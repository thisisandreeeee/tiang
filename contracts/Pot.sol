// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/payment/escrow/ConditionalEscrow.sol";

contract Pot is ConditionalEscrow {
    function withdrawalAllowed(address _payee)
        public
        view
        override
        returns (bool)
    {
        return false;
    }
}

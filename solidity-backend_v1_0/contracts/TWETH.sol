// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TWETH is ERC20 {

    constructor() ERC20("TWETH token", "TWETH") {
        _mint(msg.sender, 10000 * 10**18);
    }

    function deposit() external payable {
        _mint(msg.sender, msg.value);
    }

}
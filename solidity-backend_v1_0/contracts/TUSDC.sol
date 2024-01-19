// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TUSDC is ERC20 {

    constructor() ERC20("TUSDC token", "TUSDC") {
        _mint(msg.sender, 10000 * 10**6);
    }

    // только для взаимодействия  с frontend
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

}
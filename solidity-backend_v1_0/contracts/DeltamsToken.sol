// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DeltamsToken is ERC20 {

    // mapping(address => uint256) public balances;
    // mapping(address => mapping(address => uint256)) public allowed;

    constructor() ERC20("Deltams token", "DELT") {
        _mint(msg.sender, 5000 * 10**18);
    }

    // function balanceOf(address _account) public view override returns(uint256) {
    //     return balances[_account];
    // }

    // function mintToken() public {
    //     require(1000 <= balances[msg.sender], "You not balance 1000");
    //     balances[msg.sender] = balances[msg.sender] + 1000; 
    // }

    // function transfer(address _receiver, uint256 _amount) public override returns(bool) {
    //     require(0 == _amount, "Amount not 0!");
    //     require(_amount > balances[msg.sender], "You not token amount!");

    //     balances[msg.sender] = balances[msg.sender] - _amount;
    //     balances[_receiver] = balances[_receiver] + _amount;

    //     return true;
    // }

    // function approve(address _delegate, uint256 _amount) public override returns(bool) {
    //     allowed[msg.sender][_delegate] = _amount;
    //     return true;
    // }

    // function allowance(address _owner, address _delegate) public override view returns(uint256) {
    //     return allowed[_owner][_delegate];
    // }

}
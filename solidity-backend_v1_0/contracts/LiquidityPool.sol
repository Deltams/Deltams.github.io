// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ICentralAccount {
    function approve(address _token, address _account, uint256 _amount) external;
    function getCountUSDCTraders() external view returns (uint256);
}

contract LiquidityPool is Ownable {
    using TransferHelper for IERC20;    
    mapping(address => uint256) investorToShare; // investor to share
    ICentralAccount public ICA;
    IERC20 public USDC; // USDC
    uint256 public balanceX; // balance of contract in 1e6
    uint256 public balanceY; // balance of contract in 1e18 total shares
    uint256 constant SHARE_DECIMALS = 10 ** 18;
    uint256 constant USDC_DECIMALS = 10 ** 6;

    constructor(address _USDC, address _CA, uint256 _amount) Ownable(msg.sender) {
        require(_amount > 0, "More amount!");
        USDC = IERC20(_USDC);
        ICA = ICentralAccount(_CA);
        balanceX = _amount;
        balanceY = _amount * SHARE_DECIMALS / USDC_DECIMALS;
    }

    function getBalanceLiquidityPool() external view returns(uint256) {
        return balanceX;
    }

    function transferToLP(uint256 _amount) external {
        require(balanceX > 0, "Ask the contract owner to increase the amount of money on the contract!");
        uint256 newY = balanceY * _amount / balanceX;
        investorToShare[msg.sender] += newY; // % 18
        balanceY = balanceY + newY;
        balanceX = balanceX + _amount;
        transfer(msg.sender, address(ICA), _amount);
    }

    function accrueProfit(uint256 _amount) external {
        require(msg.sender == address(ICA), "Only the central account can indicate income!");
        balanceX = balanceX + _amount;
    }

    function accrueLoss(uint256 _amount) external {
        require(msg.sender == address(ICA), "Only the central account can indicate a loss!");
        if (balanceX < _amount) {
            balanceX = 0;
        } else {
            balanceX = balanceX - _amount;
        }
    }

    function transfer(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        // Transfer the token from the user to the smart contract
        USDC.transferFrom(_from, _to, _amount);
    }

    function safeTransferFrom(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        TransferHelper.safeTransferFrom(_token, _from, _to, _amount);
    }

    function withdraw(uint256 _amount) external {
        uint256 investorUSDC = investorToShare[msg.sender] * balanceX / balanceY;
        require(_amount <= investorUSDC, "There are not enough funds to withdraw! Are you trying to withdraw more USDC than you have.");
        uint256 balanceCA = USDC.balanceOf(address(ICA));
        require(_amount <= balanceCA, "At the moment, there is not enough money on the contract to withdraw this amount!");
        require(ICA.getCountUSDCTraders() <= balanceCA - _amount, "You cannot withdraw this amount, as it is currently being traded!");
        uint256 whithdrawShare = balanceY * _amount / balanceX; // % 18
        investorToShare[msg.sender] -= whithdrawShare;
        balanceY = balanceY - whithdrawShare;
        balanceX = balanceX - _amount;
        ICA.approve(address(USDC), address(this), _amount);
        safeTransferFrom(address(USDC), address(ICA), msg.sender, _amount);
    }

    // This function returns number of tokens in the smart contract
    function getUserBalance() public view returns (uint256) {
        return investorToShare[msg.sender] * balanceX / balanceY;
    }

}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

interface ILiquidityPool {
    function accrueProfit(uint256 _amount) external;

    function accrueLoss(uint256 _amount) external;

    function getBalanceLiquidityPool() external view returns(uint256);
}

interface ITraderAccount {
    function accrueProfit(uint256 _amount) external;
}

contract CentralAccount is Ownable {
    using TransferHelper for IERC20;
    address SC; // swap contract   
    ILiquidityPool public ILP; // liqudity pool
    ITraderAccount public ITRA; // Trader account
    IERC20 public USDC; // USDC
    IERC20 public WETH; // WETH
    uint256 public countUSDCTraders;
    uint256 public countUSDCOwner;
    uint16 public ownerProfit = 1000;
    uint16 constant COEF_OWNER_PROFIT = 10000;

    constructor(address _USDC, address _WETH) Ownable(msg.sender) {
        USDC = IERC20(_USDC);
        WETH = IERC20(_WETH);
    }

    function setLP(address _LP) external onlyOwner() {
        ILP = ILiquidityPool(_LP);
    }

    function setTRA(address _TRA) external onlyOwner() {
        ITRA = ITraderAccount(_TRA);
    }

    function setSC(address _SC) external onlyOwner() {
        SC = _SC;
    }

    function setOwnerProfit(uint16 _ownerProfit) external onlyOwner() {
        require(_ownerProfit <= COEF_OWNER_PROFIT, "You cannot accrue more than 100% of the profit!");
        ownerProfit = _ownerProfit;
    }

    function approve(address _token, address _account, uint256 _amount) external {
        require(
            msg.sender == address(ILP) || msg.sender == address(ITRA) || msg.sender == SC,
            "Function accessible only by the liquidity pool, swap contract and Trading account !!"
        );
        TransferHelper.safeApprove(_token, _account, _amount);
    }

    function newProfit(uint256 _amount) internal {
        ILP.accrueProfit(_amount);
    }

    function newLoss(uint256 _amount) internal {
        ILP.accrueLoss(_amount);
    }

    function getTraderDebt(uint256 _amount) external onlyTRA() {
        uint256 answer = this.availableUSDC();
        require(answer >= _amount, "At the moment there are not enough free USDC on the contract of the central account, try to call the function later!!!");
        countUSDCTraders = countUSDCTraders + _amount;
    }

    function getCountUSDCTraders() external view returns (uint256) {
        return countUSDCTraders;
    }

    // profit - true; loss - false
    function returnTraderDebt(uint256 _amount, uint256 _profitOrLoss, bool _PORL) external onlyTRA() {
        if (_profitOrLoss == 0) {
            return;
        }
        if (_PORL) {
            countUSDCOwner = countUSDCOwner + _profitOrLoss * ownerProfit / COEF_OWNER_PROFIT;
            newProfit(_profitOrLoss * (COEF_OWNER_PROFIT - ownerProfit) / COEF_OWNER_PROFIT);
        } else {
            newLoss(_profitOrLoss);
        }
        if (countUSDCTraders < _amount) {
            countUSDCTraders = 0;
        } else {
            countUSDCTraders = countUSDCTraders - _amount;
        }
    }

    function availableUSDC() public view returns(uint256 answer) {
        answer = ILP.getBalanceLiquidityPool();
        require(answer >= countUSDCTraders, "It is impossible to give traders more money than is in the central account!!!");
        answer = answer - countUSDCTraders;
        return answer;
    }

    function withdraw(uint256 _amount) external onlyOwner() {
        require(_amount <= countUSDCOwner, "It is impossible to withdraw more than the specified income.");
        USDC.transfer(msg.sender, _amount);
    }

    modifier onlyTRA() {
        require(
            msg.sender == address(ITRA),
            "Only the contract trader of the account has the right to receive a debt!!!"
        );
        _;
    }

}

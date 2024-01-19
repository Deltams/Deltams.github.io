// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // добавить объект в node_modules yarn add package name
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

interface IRiskManager {
    function addTrader(address _trader) external;
    function deleteTrader(address _trader) external;
}

interface ICentralAccount {
    function approve(address _token, address _account, uint256 _amount) external;

    function getTraderDebt(uint256 _amount) external;

    function returnTraderDebt(uint256 _amount, uint256 _profitOrLoss, bool _PORL) external;
}

interface ISwapContract {
    function quoteWETHToUSDC(uint256 _amountIn) external view returns(uint256 amountOut);

    function swapUSDCToWETH(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut);

    function swapWETHToUSDC(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut);
}

contract TraderAccount is Ownable {
    mapping(address => uint256) traderToUSDC; // trader money in USDC
    mapping(address => uint256) traderToWEther; // trader money in Ether
    mapping(address => uint256) traderToDebt; // trader Debt money USD
    mapping(address => uint256) traderToTime; // at what time did the trader receive the Debt
    IRiskManager public IRM; // risk manager
    ISwapContract public ISC; // swap contract
    ICentralAccount public ICA; // central account
    IERC20 public USDC; // USDC
    IERC20 public WETH; // WETH
    uint16 public debtInterest = 200;
    uint16 constant HF_DECIMALS = 10 ** 4;
    uint16 constant COEF_DEBT_INTEREST = 10000;
    uint8 constant COEF_DEBT = 10;
    

    constructor(address _USDC, address _WETH, address _CA) Ownable(msg.sender) {
        USDC = IERC20(_USDC);
        WETH = IERC20(_WETH);
        ICA = ICentralAccount(_CA);
    }

    function setRiskManager(address _RM) external onlyOwner() {
        IRM = IRiskManager(_RM);
    }

    function setSwapContract(address _SC) external onlyOwner() {
        ISC = ISwapContract(_SC);
    }

    function setDebtInterest(uint16 _newDebtInterest) external onlyOwner() {
        require(_newDebtInterest <= COEF_DEBT_INTEREST, "You cannot accrue more than 100% of the profit!");
        debtInterest = _newDebtInterest;
    }

    // Перед вызовом данной функции необходимо дать разрешение на перевод данному контракту
    function transferToTraderUSDC(uint256 _amount) external {
        traderToUSDC[msg.sender] += _amount;
        transfer(msg.sender, address(ICA), _amount);
    }

    function transferDebtFromCA(uint256 _amount) external {
        require(traderToDebt[msg.sender] == 0, "Pay back the debt!");
        require(traderToUSDC[msg.sender] * COEF_DEBT >= _amount, "It is impossible to receive an amount more than 10 times more than the available funds in the account!");
        ICA.getTraderDebt(_amount);
        IRM.addTrader(msg.sender);
        traderToTime[msg.sender] = block.timestamp;
        traderToDebt[msg.sender] = _amount;
        traderToUSDC[msg.sender] += _amount;
    }

    function transferDebtToCA() external {
        uint256 _amount = traderToDebt[msg.sender];
        uint256 profit = _amount * debtInterest / COEF_DEBT_INTEREST;
        require(traderToUSDC[msg.sender] >= _amount + profit, "There are not enough funds to repay the debt, top up your account or transfer the WETH to the USDC");
        ICA.returnTraderDebt(_amount, profit, true);
        IRM.deleteTrader(msg.sender);
        traderToDebt[msg.sender] = 0;
        traderToUSDC[msg.sender] = traderToUSDC[msg.sender] - (_amount + profit);
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

    function withdrawUSDC(uint256 _amount) external {
        require(traderToDebt[msg.sender] == 0, "Pay back the debt");
        require(traderToUSDC[msg.sender] >= _amount, "Your USDC is less than amount");
        traderToUSDC[msg.sender] -= _amount;
        ICA.approve(address(USDC), address(this), _amount);
        safeTransferFrom(address(USDC), address(ICA), msg.sender, _amount);
    }

    // This function returns number of tokens in the smart contract
    function getUserBalanceUSDC() public view returns (uint256) {
        return traderToUSDC[msg.sender];
    }

    function getUserBalanceUSDCWithoutDebt() public view returns (uint256) {
        uint256 accountValueUSDC = this.getAccountValueInUSDC(msg.sender);
        require(traderToDebt[msg.sender] <=  accountValueUSDC, "The cost of the USDC account is lower than the loan issued!");
        return accountValueUSDC - traderToDebt[msg.sender];
    }

    function getUserDebt() public view returns (uint256) {
        return traderToDebt[msg.sender];
    }

    function getUserBalanceWEther() public view returns (uint256) {
        return traderToWEther[msg.sender];
    }

    // Получить текущую стоимость аккаунта в USDC
    function getAccountValueInUSDC(address _trader) public view returns (uint256) {
        uint256 WETHInUSDC = ISC.quoteWETHToUSDC(traderToWEther[_trader]);
        return WETHInUSDC + traderToUSDC[_trader]; 
    }

    // Уничтожить аккаунт и передать деньги CA
    function eliminate(address _traderKill) external onlyRM() {
        // перевод денег через Uniswap в USDC
        uint256 returnUSDC = ISC.swapWETHToUSDC(traderToWEther[_traderKill], traderToWEther[_traderKill]);
        returnUSDC += traderToUSDC[_traderKill];
        if (traderToDebt[_traderKill] <= returnUSDC) {
            ICA.returnTraderDebt(traderToDebt[_traderKill], returnUSDC - traderToDebt[_traderKill], true);
        } else {
            ICA.returnTraderDebt(traderToDebt[_traderKill], traderToDebt[_traderKill] - returnUSDC, false);
        }
        traderToUSDC[_traderKill] = 0;
        traderToDebt[_traderKill] = 0;
        traderToWEther[_traderKill] = 0;
    }

    // Оценка риска ликвидации
    function getHF(address _trader) external view returns (uint256 _HF) {
        require(traderToDebt[_trader] > 0, "You have no debt, it is impossible to calculate the risk!");
        _HF = uint128(this.getAccountValueInUSDC(_trader) * HF_DECIMALS / traderToDebt[_trader]);
        return _HF; // Если HF <= 1.05 вызывать eliminate
    }

    // Получить количество дней от взятия кредита
    function getDayDebt(address _trader) external view returns (uint256 _days) {
        require(traderToDebt[_trader] > 0, "You have no debts, it is impossible to calculate the time!");
        _days = (block.timestamp - traderToTime[_trader]) / 60 / 60 / 24;
        return _days;
    }

    // перевод USDC в WETH через Uniswap
    function swapUSDCToWETH(uint256 _amount, uint256 _amountOutMinimum) public {
        require(_amount <= traderToUSDC[msg.sender], "Not enough USDC");
        // должна вернуть сумму, полученную в USDC
        uint256 transferedUSDC = ISC.swapUSDCToWETH(_amount, _amountOutMinimum);
        traderToUSDC[msg.sender] -= _amount;
        traderToWEther[msg.sender] += transferedUSDC;
    }

    // перевод WETH в USDC через Uniswap
    function swapWETHToUSDC(uint256 _amount, uint256 _amountOutMinimum) public {
        require(_amount <= traderToWEther[msg.sender], "Not enough WETH");
        // должна вернуть сумму, полученную в WETH
        uint256 transferedWETH = ISC.swapWETHToUSDC(_amount, _amountOutMinimum);
        traderToUSDC[msg.sender] += transferedWETH;
        traderToWEther[msg.sender] -= _amount;
    }

    // onlyRM modifier that validates only
    modifier onlyRM() {
        require(
            msg.sender == address(IRM),
            "Only the contract risk manager has the right to liquidate the account !!"
        );
        _;
    }
}

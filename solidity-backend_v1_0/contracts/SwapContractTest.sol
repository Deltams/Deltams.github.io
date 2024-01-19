// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
//import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 
import "@uniswap/v2-periphery/contracts/UniswapV2Router02.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
//import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

interface ICentralAccount {
    function approve(address _token, address _account, uint256 _amount) external;
}

contract SwapContractTest is Ownable {
    using TransferHelper for IERC20; 
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    ISwapRouter public constant router = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    ICentralAccount public ICA; //central account
    address public TRA; //trader account
    address public USDC_uniswap = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48; // USDC
    address public WETH_uniswap = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2; // WETH
    IERC20 public USDC; // USDC
    IERC20 public WETH; // WETH

    UniswapV2Router02 public constant router02 = UniswapV2Router02(payable(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D));

    event quotedWETHToUSDC(uint256 _amountOut);

    event swapTokens(uint256 _amountOut);

    constructor(address _CA, address _TRA, address _USDC, address _WETH) Ownable(msg.sender) {
        ICA = ICentralAccount(_CA);
        TRA = _TRA;
        USDC = IERC20(_USDC);
        WETH = IERC20(_WETH);
    }

    function quoteWETHToUSDC(uint256 _amountIn) public view returns(uint256) {
        
        if(_amountIn == 0){
            return 0;
        }

        address[] memory arr = new address[](2);
        arr[0] = WETH_uniswap;
        arr[1] = USDC_uniswap;
        return router02.getAmountsOut(
          _amountIn,
          arr
        )[1];
    }

    function quoteUSDCToWETH(uint256 _amountIn) public view returns(uint256) {
        
        if(_amountIn == 0){
            return 0;
        }

        address[] memory arr = new address[](2);
        arr[0] = USDC_uniswap;
        arr[1] = WETH_uniswap;
        return router02.getAmountsOut(
          _amountIn,
          arr
        )[1];
    }

    function swapWETHToUSDC(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256) {
        require(msg.sender == TRA, "access not required");

        ICA.approve(address(WETH), address(this), _amountIn);
        TransferHelper.safeTransferFrom(address(WETH), address(ICA), address(this), _amountIn);

        uint256 amountOut = quoteWETHToUSDC(_amountIn);

        require(amountOut>=_amountOutMinimum, "not enough token");

        USDC.transfer(address(ICA), amountOut);

        return amountOut;
    }

    function swapUSDCToWETH(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256) {
        require(msg.sender == TRA, "access not required");

        ICA.approve(address(USDC), address(this), _amountIn);
        TransferHelper.safeTransferFrom(address(USDC), address(ICA), address(this), _amountIn);

        uint256 amountOut = quoteUSDCToWETH(_amountIn);

        require(amountOut>=_amountOutMinimum, "not enough token");

        WETH.transfer(address(ICA), amountOut);

        emit swapTokens(amountOut);

        return amountOut;
    }
}
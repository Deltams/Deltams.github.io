// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

interface ICentralAccount {
    function approve(address _token, address _account, uint256 _amount) external;
}

contract SwapContract is Ownable {
    using TransferHelper for IERC20; 
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    ISwapRouter public constant router = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    ICentralAccount public ICA; //central account
    address public TRA; //trader account
    address public USDC; // USDC
    address public WETH; // WETH

    constructor(address _CA, address _TRA, address _USDC, address _WETH) Ownable(msg.sender) {
        ICA = ICentralAccount(_CA);
        TRA = _TRA;
        USDC = _USDC;
        WETH = _WETH;
    }

    function quoteWETHToUSDC(uint256 _amountIn) external returns(uint256) {
        
        if(_amountIn == 0){
            return 0;
        }

        return quoter.quoteExactInputSingle(WETH, USDC, 500, _amountIn, 0);
    }

    function swapWETHToUSDC(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut) {
        require(msg.sender == TRA, "access not required");

        ICA.approve(WETH, address(this), _amountIn);
        TransferHelper.safeTransferFrom(WETH, address(ICA), address(this), _amountIn);

        TransferHelper.safeApprove(WETH, address(router), _amountIn);
        
        uint24 poolFee = 500;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: WETH,
            tokenOut: USDC,
            fee: poolFee,
            recipient: address(ICA),
            deadline: block.timestamp + 15,
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMinimum, 
            sqrtPriceLimitX96: 0
        });

        amountOut = router.exactInputSingle(params);

        return amountOut;
    }

    function swapUSDCToWETH(uint256 _amountIn, uint256 _amountOutMinimum) external returns(uint256 amountOut) {
        require(msg.sender == TRA, "access not required");

        ICA.approve(USDC, address(this), _amountIn);

        TransferHelper.safeTransferFrom(USDC, address(ICA), address(this), _amountIn);
        TransferHelper.safeApprove(USDC, address(router), _amountIn);
        
        uint24 poolFee = 500;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: USDC,
            tokenOut: WETH,
            fee: poolFee,
            recipient: address(ICA),
            deadline: block.timestamp + 15,
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMinimum, 
            sqrtPriceLimitX96: 0
        });

        amountOut = router.exactInputSingle(params);

        return amountOut;
    }
}

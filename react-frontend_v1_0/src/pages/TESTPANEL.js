import React, { Component } from "react";
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ethers } from "ethers";

export default class TraderAccount extends Component {
    constructor() {
        super();

        this.state = {
            userAccount: ""             // Адрес кошелька, с которым происходит взаимодействие 
        };
        
        // Заполняем необходимую информацию по контрактам
        // this.addressLP = "0x76a999d5f7efde0a300e710e6f52fb0a4b61ad58"; // В тестовой сети Вероника
        this.addressLP = "0x72822AfF9158df12ab95647126fC9D9B7689c06b"; // В основной сети Арбитрум
        this.abiLP = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_CA","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"accrueLoss","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"accrueProfit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"balanceX","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"balanceY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferToLP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressUSDC = "0xae246e208ea35b3f23de72b697d47044fc594d5f"; // В тестовой сети Вероника
        this.addressUSDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // В основной сети Арбитрум
        this.abiUSDC = `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressCA = "0x084815d1330ecc3ef94193a19ec222c0c73dff2d"; // В тестовой сети Вероника
        this.addressCA = "0x0b3c1665bD2dc2fAcB5f28867Ce65792382ffE2A"; // В основной сети Арбитрум
        this.abiCA = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ILP","outputs":[{"internalType":"contract ILiquidityPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ITRA","outputs":[{"internalType":"contract ITraderAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"availableUSDC","outputs":[{"internalType":"uint256","name":"answer","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"countUSDCOwner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"countUSDCTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCountUSDCTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getTraderDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownerProfit","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_profitOrLoss","type":"uint256"},{"internalType":"bool","name":"_PORL","type":"bool"}],"name":"returnTraderDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_LP","type":"address"}],"name":"setLP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_ownerProfit","type":"uint16"}],"name":"setOwnerProfit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_SC","type":"address"}],"name":"setSC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_TRA","type":"address"}],"name":"setTRA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressTRA = "0x564db7a11653228164fd03bca60465270e67b3d7"; // В тестовой сети Вероника
        this.addressTRA = "0xCC0f61B9Be16F4E7BFb635aaf9Dc42F1DE81B232"; // В основной сети Арбитрум
        this.abiTRA = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"},{"internalType":"address","name":"_CA","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"IRM","outputs":[{"internalType":"contract IRiskManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ISC","outputs":[{"internalType":"contract ISwapContract","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtInterest","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_traderKill","type":"address"}],"name":"eliminate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getAccountValueInUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getDayDebt","outputs":[{"internalType":"uint256","name":"_days","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getHF","outputs":[{"internalType":"uint256","name":"_HF","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalanceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalanceUSDCWithoutDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalanceWEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_newDebtInterest","type":"uint16"}],"name":"setDebtInterest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_RM","type":"address"}],"name":"setRiskManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_SC","type":"address"}],"name":"setSwapContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapUSDCToWETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapWETHToUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferDebtFromCA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"transferDebtToCA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferToTraderUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressSC = "0xf8b299f87ebb62e0b625eaf440b73cc6b7717dbd"; // В тестовой сети Вероника
        // this.addressSC = "0x8a791620dd6260079bf849dc5567adc3f2fdc318"; // В тестовой сети Димитрий
        this.addressSC = "0x82a90Ad338bc5134d0630Ba6A6d029f636621AD6"; // В основной сети Арбитрум
        this.abiSC = `[{"inputs":[{"internalType":"address","name":"_CA","type":"address"},{"internalType":"address","name":"_TRA","type":"address"},{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"_amountOut","type":"uint256"}],"name":"quotedWETHToUSDC","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRA","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"}],"name":"quoteWETHToUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"quoter","outputs":[{"internalType":"contract IQuoter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"router","outputs":[{"internalType":"contract ISwapRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"router02","outputs":[{"internalType":"contract UniswapV2Router02","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapUSDCToWETH","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapWETHToUSDC","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressRM = "0x484242986f57dfca98eec2c78427931c63f1c4ce"; // В тестовой сети Вероника
        // this.addressRM = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"; // В тестовой сети Димитрий
        this.addressRM = "0x2E935f81B1683bE1227D2A9448C957f378961De8"; // В основной сети Арбитрум
        this.abiRM = `[{"inputs":[{"internalType":"address","name":"_TRA","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"HF_ELIMINATE","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ITRA","outputs":[{"internalType":"contract ITraderAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"addTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTraders","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTradersDay","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"deleteTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_traderId","type":"uint256"}],"name":"eliminate","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCountTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_new_HF_ELIMINATE","type":"uint16"}],"name":"setHFEliminate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
        // this.addressWETH = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"; // В тестовой сети Дмитрий
        this.addressWETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // В основной сети Арбитрум
        this.abiWETH = `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;


        // Делаем привязку к функции контекста this
        this.getHF = this.getHF.bind(this);
        this.sendDebt = this.sendDebt.bind(this);
        this.sendDeposit = this.sendDeposit.bind(this);
        this.sendWithdraw = this.sendWithdraw.bind(this);
        this.sendSetLpToCA = this.sendSetLpToCA.bind(this);
        this.getBalanceMyLP = this.getBalanceMyLP.bind(this);
        this.sendReturnDebt = this.sendReturnDebt.bind(this);
        this.getAddressUSDC = this.getAddressUSDC.bind(this);
        this.getAddressWETH = this.getAddressWETH.bind(this);
        this.getMyBalanceUSDC = this.getMyBalanceUSDC.bind(this);
        this.getBalanceUSDCCA = this.getBalanceUSDCCA.bind(this);
        this.getBalanceWETHCA = this.getBalanceWETHCA.bind(this);
        this.sendSwapUSDCToWETH = this.sendSwapUSDCToWETH.bind(this);
        this.sendSwapWETHToUSDC = this.sendSwapWETHToUSDC.bind(this);
        this.getBalanceTraderWETH = this.getBalanceTraderWETH.bind(this);
        this.getBalanceTraderUSDC = this.getBalanceTraderUSDC.bind(this);
    }

    onToastUser(messageUser, negative) {
        if (negative === true) {
            alert('Negative: ' + messageUser);
        } else {
            alert('Positive: ' + messageUser);
        }
    }

    formatMoneyUser(strMoney, decimals) {
        if (strMoney === "0") {
            return "there is nothing : (";
        }
        let check = 0, answer = "", decimalsView = 2;
        if (decimals === true) {
            let step = 0;
            for (let i = strMoney.length - 5; i >= 0; i--) {
                if (step === 2) {
                    break;
                }
                answer = strMoney[i] + answer;
                step++;
            }
            answer = "." + answer;
        }
        for (let i = strMoney.length - 5 - decimalsView; i >= 0; i--) {
            if (check === 3) {
                answer = " " + answer;
                check = 0;
            }
            answer = strMoney[i] + answer;
            check++;
        }
        return answer + " $";
    }

    async sendDeposit() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            const USDCContract = new ethers.Contract(
                this.addressUSDC,
                this.abiUSDC,
                signer
            );
            try {
                await USDCContract.approve(this.addressTRA, ethers.parseUnits("200", 6));
                await TraderAccountContract.transferToTraderUSDC(ethers.parseUnits("200", 6));
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendWithdraw() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                await TraderAccountContract.withdrawUSDC(ethers.parseUnits("200", 6));
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendDebt() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                await TraderAccountContract.transferDebtFromCA(ethers.parseUnits("1000", 6));
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendReturnDebt() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                await TraderAccountContract.transferDebtToCA();
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendSwapUSDCToWETH() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                await TraderAccountContract.swapUSDCToWETH(await TraderAccountContract.getUserBalanceUSDC(), ethers.parseUnits("0", 0));
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendSwapWETHToUSDC() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                await TraderAccountContract.swapWETHToUSDC(await TraderAccountContract.getUserBalanceWEther(), ethers.parseUnits("0", 0));
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getMyBalanceUSDC() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                this.onToastUser(this.formatMoneyUser((await TraderAccountContract.getUserBalanceUSDC()).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getHF() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const TraderAccountContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                signer
            );
            try {
                this.onToastUser((await TraderAccountContract.getHF(this.state.userAccount)).toString(), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getBalanceUSDCCA() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const USDCContract = new ethers.Contract(
                this.addressUSDC,
                this.abiUSDC,
                provider
            );
            try {
                this.onToastUser(this.formatMoneyUser((await USDCContract.balanceOf(this.addressCA)).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getBalanceWETHCA() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const WETHContract = new ethers.Contract(
                this.addressWETH,
                this.abiWETH,
                provider
            );
            try {
                this.onToastUser(this.formatMoneyUser((await WETHContract.balanceOf(this.addressCA)).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getBalanceTraderWETH() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const TRAContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                provider
            );
            try {
                this.onToastUser(this.formatMoneyUser((await TRAContract.getUserBalanceWEther()).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getBalanceTraderUSDC() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const TRAContract = new ethers.Contract(
                this.addressTRA,
                this.abiTRA,
                provider
            );
            try {
                this.onToastUser(this.formatMoneyUser((await TRAContract.getUserBalanceUSDC()).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getBalanceMyLP() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const LPContract = new ethers.Contract(
                this.addressLP,
                this.abiLP,
                provider
            );
            try {
                this.onToastUser(this.formatMoneyUser((await LPContract.getUserBalance()).toString(), true), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getAddressWETH() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const CAContract = new ethers.Contract(
                this.addressCA,
                this.abiCA,
                provider
            );
            try {
                this.onToastUser((await CAContract.WETH()).toString(), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getAddressUSDC() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const CAContract = new ethers.Contract(
                this.addressCA,
                this.abiCA,
                provider
            );
            try {
                this.onToastUser((await CAContract.USDC()).toString(), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendSetLpToCA() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const CAContract = new ethers.Contract(
                this.addressCA,
                this.abiCA,
                signer
            );
            try {
                // await CAContract.setSC('0x82a90Ad338bc5134d0630Ba6A6d029f636621AD6');
                this.onToastUser((await CAContract.SC()).toString(), false);
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async componentDidMount() {
        if (window.ethereum){
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            }); 
            this.setState({userAccount: accounts[0]});
        } else {
            console.log("Connect MetaMask!");
        }
    }

    render() {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '110vh' }}>
                <div style={{ position: 'relative' }}>
                    <div className="rectangle" 
                    style={{
                        height: '320px',
                        width: '370px',
                        border: '2px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.sendSwapUSDCToWETH} variant="dark" style={{ width: '150px' }}>USDC to WETH</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.sendSwapWETHToUSDC} variant="secondary" style={{ width: '150px' }}>WETH to USDC</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.sendDebt} variant="dark" style={{ width: '150px' }}>DEBT</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.sendReturnDebt} variant="secondary" style={{ width: '150px' }}>RETURN DEBT</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.sendDeposit} variant="dark" style={{ width: '150px' }}>Deposit</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.sendWithdraw} variant="secondary" style={{ width: '150px' }}>Withdraw</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.getHF} variant="dark" style={{ width: '150px' }}>My TRA HF</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.getMyBalanceUSDC} variant="secondary" style={{ width: '150px' }}>My TRA balance</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.getBalanceTraderWETH} variant="dark" style={{ width: '150px' }}>TRA my balance WETH</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.getBalanceTraderUSDC} variant="secondary" style={{ width: '150px' }}>TRA my balance USDC</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.getBalanceWETHCA} variant="dark" style={{ width: '150px' }}>CA balance WETH</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.getBalanceUSDCCA} variant="secondary" style={{ width: '150px' }}>CA balance USDC</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.getAddressWETH} variant="dark" style={{ width: '150px' }}>Address WETH</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.getAddressUSDC} variant="secondary" style={{ width: '150px' }}>Address USDC</Button>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-end">
                                <Button onClick={this.getBalanceMyLP} variant="dark" style={{ width: '150px' }}>MY LP BALANCE</Button>
                            </Col>
                            <Col className="text-start">
                                <Button onClick={this.sendSetLpToCA} variant="secondary" style={{ width: '150px' }}>Set LP</Button>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Container>
        )
    }
}

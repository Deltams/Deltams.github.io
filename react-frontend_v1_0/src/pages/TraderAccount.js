import React, { Component } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { ethers } from "ethers";

export default class TraderAccount extends Component {
  constructor() {
    super();

    this.state = {
      balanceUser: "0", // Баланс на кошельке пользователя

      // Для подключения слежки завершения транзакции
      approveInterval: null,

      // Текущие данные view
      currentWETHQuote: null, //
      currentMarginLevel: null, // ???
      currentAvailable: null, // доступные трейдеру USDC
      currentAvailableWETH: null, // доступные трейдеру WETH

      // Для отображения
      showBorrow: 1, // страница взаимодействия 0 - Deposit, 1 - DEBT, 2 - Exchange
      hiddenDeposit: false, // Переключатель для показа формы внесения депозита
      hiddenWithdraw: false, // Переключатель для показа формы вывода депозита

      // Для логики форм
      typeOfSwap: "0", // тип обмена 0 - USDC/WETH, 1 - WETH/USDC

      // Поля форм
      userAmountSend: "", // Сколько пользователь готов внести в Liquidity pool
      userAmountSendTRA: "", // Сколько пользователь готов внести в TRA
      userAmountBorrowTRA: "", // Сколько пользователь готов взять из LP
      userAmountExchangeTRA: "", // Сколько пользователь готов обменять через TRA

      // Для трейдера
      userAccount: "", // Адрес кошелька, с которым происходит взаимодействие
      // Данные его позиции
      userWETHToUSDC: "", // WETH на контракте, оцененные в USDC [WETH]
      userMargin: "", // USDC в момент получения плеча [Margin]
      userDeposit: "", // USDC, положенные на счет TRA [Your deposit]
      userHF: "", // HF трейдера [HF]
      userEntryPrice: "", //
      userLiquidityPrice: "", // стоимость WETH при которой будет проведена ликвидация [Liquidity price]
      userDifference: "", //
      userDEBT: "", // долг трейдера [Debt]
    };

    // Заполняем необходимую информацию по контрактам
    // this.addressLP = "0x76a999d5f7efde0a300e710e6f52fb0a4b61ad58"; // В тестовой сети Вероника
    // this.addressLP = "0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9"; // В тестовой сети Димитрий
    this.addressLP = "0x72822AfF9158df12ab95647126fC9D9B7689c06b"; // В основной сети Арбитрум
    this.abiLP = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_CA","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"accrueLoss","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"accrueProfit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"balanceX","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"balanceY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferToLP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
    // this.addressUSDC = "0xae246e208ea35b3f23de72b697d47044fc594d5f"; // В тестовой сети Вероника
    // this.addressUSDC = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // В тестовой сети Димитрий
    this.addressUSDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // В основной сети Арбитрум
    this.abiUSDC = `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;
    // this.addressCA = "0x084815d1330ecc3ef94193a19ec222c0c73dff2d"; // В тестовой сети Вероника
    // this.addressCA = "0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0"; // В тестовой сети Димитрий
    this.addressCA = "0x0b3c1665bD2dc2fAcB5f28867Ce65792382ffE2A"; // В основной сети Арбитрум
    this.abiCA = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ILP","outputs":[{"internalType":"contract ILiquidityPool","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ITRA","outputs":[{"internalType":"contract ITraderAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"address","name":"_account","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"availableUSDC","outputs":[{"internalType":"uint256","name":"answer","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"countUSDCOwner","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"countUSDCTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getCountUSDCTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"getTraderDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownerProfit","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_profitOrLoss","type":"uint256"},{"internalType":"bool","name":"_PORL","type":"bool"}],"name":"returnTraderDebt","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_LP","type":"address"}],"name":"setLP","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_ownerProfit","type":"uint16"}],"name":"setOwnerProfit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_SC","type":"address"}],"name":"setSC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_TRA","type":"address"}],"name":"setTRA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
    // this.addressTRA = "0x564db7a11653228164fd03bca60465270e67b3d7"; // В тестовой сети Вероника
    // this.addressTRA = "0x5fc8d32690cc91d4c39d9d3abcbd16989f875707"; // В тестовой сети Димитрий
    this.addressTRA = "0x0D6C402B00f2d5Afa02050BA53eEA1F69d30911D"; // В основной сети Арбитрум
    this.abiTRA = `[{"inputs":[{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"},{"internalType":"address","name":"_CA","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"IRM","outputs":[{"internalType":"contract IRiskManager","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ISC","outputs":[{"internalType":"contract ISwapContract","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"debtInterest","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_traderKill","type":"address"}],"name":"eliminate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getAccountValueInUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getDayDebt","outputs":[{"internalType":"uint256","name":"_days","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"getHF","outputs":[{"internalType":"uint256","name":"_HF","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getUserBalanceUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserBalanceUSDCWithoutDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getUserBalanceWEther","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getUserDebt","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_newDebtInterest","type":"uint16"}],"name":"setDebtInterest","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_RM","type":"address"}],"name":"setRiskManager","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_SC","type":"address"}],"name":"setSwapContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapUSDCToWETH","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapWETHToUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferDebtFromCA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"transferDebtToCA","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferToTraderUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdrawUSDC","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
    // this.addressSC = "0xf8b299f87ebb62e0b625eaf440b73cc6b7717dbd"; // В тестовой сети Вероника
    // this.addressSC = "0x8a791620dd6260079bf849dc5567adc3f2fdc318"; // В тестовой сети Димитрий
    this.addressSC = "0xED18bF2187b214F988aAaF36Ac41d01E1cb6375F"; // В основной сети Арбитрум
    this.abiSC = `[{"inputs":[{"internalType":"address","name":"_CA","type":"address"},{"internalType":"address","name":"_TRA","type":"address"},{"internalType":"address","name":"_USDC","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"ICA","outputs":[{"internalType":"contract ICentralAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRA","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"USDC","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"}],"name":"quoteWETHToUSDC","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"quoter","outputs":[{"internalType":"contract IQuoter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"router","outputs":[{"internalType":"contract ISwapRouter","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapUSDCToWETH","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amountIn","type":"uint256"},{"internalType":"uint256","name":"_amountOutMinimum","type":"uint256"}],"name":"swapWETHToUSDC","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
    // this.addressRM = "0x484242986f57dfca98eec2c78427931c63f1c4ce"; // В тестовой сети Вероника
    // this.addressRM = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"; // В тестовой сети Димитрий
    this.addressRM = "0x971564d99098650D853cD621EBa39F969B896c08"; // В основной сети Арбитрум
    this.abiRM = `[{"inputs":[{"internalType":"address","name":"_TRA","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"HF_ELIMINATE","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ITRA","outputs":[{"internalType":"contract ITraderAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"addTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTraders","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTradersDay","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"deleteTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_traderId","type":"uint256"}],"name":"eliminate","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCountTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_new_HF_ELIMINATE","type":"uint16"}],"name":"setHFEliminate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;

    this.addressWETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"; // В основной сети Арбитрум
    this.abiWETH = `[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"allowance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientAllowance","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"needed","type":"uint256"}],"name":"ERC20InsufficientBalance","type":"error"},{"inputs":[{"internalType":"address","name":"approver","type":"address"}],"name":"ERC20InvalidApprover","type":"error"},{"inputs":[{"internalType":"address","name":"receiver","type":"address"}],"name":"ERC20InvalidReceiver","type":"error"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"ERC20InvalidSender","type":"error"},{"inputs":[{"internalType":"address","name":"spender","type":"address"}],"name":"ERC20InvalidSpender","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]`;

    // Делаем привязку к функции контекста this
    this.reloadDataTraderBalance = this.reloadDataTraderBalance.bind(this);
    this.sendUSDCTraderAccountToCentralAccount =
      this.sendUSDCTraderAccountToCentralAccount.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onHiddenDeposit = this.onHiddenDeposit.bind(this);
    this.onHiddenWithdraw = this.onHiddenWithdraw.bind(this);
    this.getCurrentQuoteWETHToUSDC = this.getCurrentQuoteWETHToUSDC.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSwapChange = this.handleSwapChange.bind(this);
    this.getUserBalanceUSDC = this.getUserBalanceUSDC.bind(this);
    this.getUserMargin = this.getUserMargin.bind(this);
    this.onShowBorrow = this.onShowBorrow.bind(this);
    this.getCurrentMarginLevel = this.getCurrentMarginLevel.bind(this);
    this.getCurrentAvailable = this.getCurrentAvailable.bind(this);
    this.getCurrentAvailableWETH = this.getCurrentAvailableWETH.bind(this);
    // this.onAddAllBalanceUser = this.onAddAllBalanceUser.bind(this);
    // this.getTotalMoneyLiquidityPool = this.getTotalMoneyLiquidityPool.bind(this);
    // this.sendDepositToLiquidityPool = this.sendDepositToLiquidityPool.bind(this);
    // this.getUserBalanceLiquidityPool = this.getUserBalanceLiquidityPool.bind(this);
    // this.sendWithdrawToLiquidityPool = this.sendWithdrawToLiquidityPool.bind(this);
    // this.getTotalTradedCentralAccount = this.getTotalTradedCentralAccount.bind(this);
    this.sendUSDCToTraderAccount = this.sendUSDCToTraderAccount.bind(this);
    this.borrowUSDCFromTraderAccount =
      this.borrowUSDCFromTraderAccount.bind(this);
    this.onToastUser = this.onToastUser.bind(this);
    this.updatePositionWETH = this.updatePositionWETH.bind(this);
    this.repayUSDCToTraderAccount = this.repayUSDCToTraderAccount.bind(this);
    this.withdrawUSDCFromTraderAccount =
      this.withdrawUSDCFromTraderAccount.bind(this);
    this.swapTokens = this.swapTokens.bind(this);
  }

  onToastUser(messageUser, negative) {
    if (negative === true) {
      alert("Negative: " + messageUser);
    } else {
      alert("Positive: " + messageUser);
    }
  }

  onClose() {
    this.setState({ hiddenDeposit: false });
    this.setState({ hiddenWithdraw: false });
  }

  async getUserBalanceUSDC() {
    if (this.state.userAccount !== "") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const USDCContract = new ethers.Contract(
        this.addressUSDC,
        this.abiUSDC,
        provider
      );
      let balance = ethers.formatUnits(
        (await USDCContract.balanceOf(this.state.userAccount)).toString(),
        6
      );
      console.log(balance);
      this.setState({
        balanceUser: balance,
      });
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async getCurrentQuoteWETHToUSDC() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const SwapContract = new ethers.Contract(
      this.addressSC,
      this.abiSC,
      provider
    );
    try {
      let value_1 = ethers.formatUnits(
        (await SwapContract.quoteWETHToUSDC.staticCall(ethers.parseUnits("1", 18))).toString(),
        6
      );
      console.log(value_1);
      this.setState({
        currentWETHQuote: value_1,
      });
    } catch (error) {
      console.log(error);
      this.onToastUser("some problems with Uniswap occured", true);
    }
  }

  async getCurrentAvailable() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const TraderAccount = new ethers.Contract(
      this.addressTRA,
      this.abiTRA,
      signer
    );
    console.log(provider);
    try {
      let balance = ethers.formatUnits(
        (await TraderAccount.getUserBalanceUSDC()).toString(),
        6
      );
      this.setState({
        currentAvailable: balance,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        currentAvailable: "some problem occured",
      });
      this.onToastUser("didn't get TRA USDC of trader", true);
    }
  }

  async getCurrentAvailableWETH() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const TraderAccount = new ethers.Contract(
      this.addressTRA,
      this.abiTRA,
      signer
    );
    console.log(provider);
    try {
      let balance = ethers.formatUnits(
        (await TraderAccount.getUserBalanceWEther()).toString(),
        18
      );
      this.setState({
        currentAvailableWETH: balance,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        currentAvailableWETH: "some problem occured",
      });
      this.onToastUser("didn't get TRA WETH of trader", true);
    }
  }

  async getCurrentMarginLevel() {
    //   const provider = new ethers.BrowserProvider(window.ethereum);
    //   const CentralAccount = new ethers.Contract(
    //     this.addressCA,
    //     this.abiCA,
    //     provider
    //   );
    //   try {
    //     let ownerProfit = ethers.formatUnits(
    //       (await CentralAccount.ownerProfit()).toString(),
    //       0
    //     );
    //     let COEF_OWNER_PROFIT = 10000;
    //     this.setState({
    //       currentMarginLevel: (ownerProfit * 100) / COEF_OWNER_PROFIT,
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     this.onToastUser("some problems with CA occured", true);
    //   }
  }

  async getUserMargin() {
    let userMargin = JSON.parse(localStorage.getItem("userMargin"));
    console.log(localStorage);
    console.log(this.state.userDEBT === "" || this.state.userDEBT === "0.0");
    if (userMargin) {
      this.setState({ userMargin: userMargin });
    }
  }

  handleInputChange(event) {
    let newValue = event.target.value;

    if (newValue === ".") {
      newValue = "0" + newValue;
    }

    newValue = newValue.replace(/[^0-9.]/g, "");

    const dotCount = (newValue.match(/\./g) || []).length;
    if (dotCount > 1) {
      return;
    }

    const dotIndex = newValue.indexOf(".");
    let checkVal = 7;
    // console.log(this.state.typeOfSwap,this.state.typeOfSwap == 1);
    // console.log(this.state.showBorrow,this.state.showBorrow === 2);
    if (this.state.showBorrow === 2 && this.state.typeOfSwap === "1") {
      checkVal = 19;
    }
    console.log(checkVal);
    if (dotIndex !== -1 && newValue.length - dotIndex > checkVal) {
      return;
    }

    if (newValue === undefined) {
      newValue = "";
    }

    switch (this.state.showBorrow) {
      case 0: {
        console.log("ok");
        this.setState({ userAmountSendTRA: newValue });
        break;
      }
      case 1: {
        this.setState({ userAmountBorrowTRA: newValue });
        break;
      }
      default: {
        this.setState({ userAmountExchangeTRA: newValue });
        break;
      }
    }
  }

  handleSwapChange(event) {
    let newValue = event.target.value;
    this.setState({ typeOfSwap: newValue });
  }

  async onHiddenDeposit() {
    if (this.state.hiddenDeposit === true) {
      //await this.sendDepositToLiquidityPool();
      this.setState({ hiddenDeposit: false });
    } else {
      // await this.getUserBalanceUSDC();
      // await this.getUserBalanceLiquidityPool();
      this.setState({ hiddenDeposit: true });
    }
  }

  async onHiddenWithdraw() {
    if (this.state.hiddenWithdraw === true) {
      // await this.sendWithdrawToLiquidityPool();
      this.setState({ hiddenWithdraw: false });
    } else {
      // await this.getUserBalanceUSDC();
      // await this.getUserBalanceLiquidityPool();
      this.setState({ hiddenWithdraw: true });
    }
  }

  async onShowBorrow(val) {
    this.setState({ showBorrow: val });
    // console.log(val);
  }

  async sendUSDCTraderAccountToCentralAccount() {
    if (this.state.userAccount !== "") {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const TraderAccountContract = new ethers.Contract(
        this.addressTRA,
        this.abiTRA,
        signer
      );
      try {
        await TraderAccountContract.transferToTraderUSDC(
          ethers.parseUnits(this.state.userAmountSendTRA, 6)
        );
        clearInterval(this.state.approveInterval);
        this.setState({ approveInterval: null });
        this.onToastUser(
          "The transfer transaction has been sent by the contract, wait for it to be completed!",
          false
        );
      } catch (err) {
        console.log(err.message);
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async sendUSDCToTraderAccount() {
    if (this.state.userAccount !== "") {
      if (this.state.userAmountSendTRA === "") {
        console.log("Empty amount");
        return;
      }
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        // console.log(ethers.parseUnits(this.state.userAmountSendTRA, 6));
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        const USDCContract = new ethers.Contract(
          this.addressUSDC,
          this.abiUSDC,
          signer
        );
        await USDCContract.approve(
          this.addressTRA,
          ethers.parseUnits(this.state.userAmountSendTRA, 6)
        );

        this.setState({
          approveInterval: setInterval(
            () => this.sendUSDCTraderAccountToCentralAccount(),
            10000
          ),
        });

        // Обновление состояния переменных

        let balanceUser_TRA = "",
          balanceUser = "",
          userMargin = "",
          userDeposit = "";
        try {
          // Доступные USDC трейдера на TRA
          balanceUser_TRA = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDC()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC трейдера на TRA без долга
          userDeposit = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
            6
          );
          // console.log("DEBT", this.state.userDEBT);
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC MetaMask
          balanceUser = ethers.formatUnits(
            (await USDCContract.balanceOf(this.state.userAccount)).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        this.setState({
          // userAmountSendTRA: "",
          currentAvailable: balanceUser_TRA,
          userMargin: userMargin,
          userDeposit: userDeposit,
          balanceUser: balanceUser,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        } else {
          this.onToastUser("Ok", false);
        }
      } catch (error) {
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async borrowUSDCFromTraderAccount() {
    if (this.state.userAccount !== "") {
      if (this.state.userAmountBorrowTRA === "") {
        console.log("Empty amount");
        return;
      }
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        await TraderAccount.transferDebtFromCA(
          ethers.parseUnits(this.state.userAmountBorrowTRA, 6)
        );
        // Обновление состояния переменных

        let balanceUser_TRA = "";
        try {
          // Доступные USDC трейдера на TRA
          balanceUser_TRA = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDC()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        let userWETH = "",
          userAllInUSDC = "",
          userMargin = "",
          userHF = "NO DEBT",
          currentMarginLevel = "NO DEBT",
          userLiquidityPrice = "NO DEBT",
          userWETHToUSDC = "",
          userDEBT = "";
        const SwapContract = new ethers.Contract(
          this.addressSC,
          this.abiSC,
          signer
        );
        const RiskManager = new ethers.Contract(
          this.addressRM,
          this.abiRM,
          signer
        );
        try {
          // Доступные WETH трейдера на TRA
          userWETH = await TraderAccount.getUserBalanceWEther();
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные WETH трейдера, оцененные в USDC, на TRA
          userWETHToUSDC = await SwapContract.quoteWETHToUSDC.staticCall(userWETH);
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Все токены трейдера, оцененные в USDC, на TRA
          userAllInUSDC = await TraderAccount.getAccountValueInUSDC.staticCall(
            this.state.userAccount
          );

          // Долг трейдера на TRA
          userDEBT = await TraderAccount.getUserDebt();

          // Расчет HF и LiquidityPrice только для пользователя с долгом
          if (ethers.formatUnits(userDEBT, 6) !== "0.0") {
            try {
              let HF_eliminate = await RiskManager.HF_ELIMINATE();
              console.log(HF_eliminate);
              userHF = await TraderAccount.getHF.staticCall(this.state.userAccount);

              if (userDEBT > ethers.parseUnits(this.state.userDeposit, 6)) {
                userLiquidityPrice = (userAllInUSDC * HF_eliminate) / userHF;
                console.log(userLiquidityPrice);
                console.log(userHF);
                console.log(HF_eliminate);
                userLiquidityPrice = ethers.formatUnits(
                  userLiquidityPrice.toString(),
                  6
                );

                currentMarginLevel = userHF - ethers.parseUnits("1", 4);
                currentMarginLevel = ethers.formatUnits(
                  currentMarginLevel.toString(),
                  2
                );
              } else {
                if (ethers.formatUnits(userWETHToUSDC, 6) === "0.0") {
                  userLiquidityPrice = "Swap some USDC";
                } else {
                  userLiquidityPrice = "Debt is less than your deposit";
                }
              }

              userHF = ethers.formatUnits(userHF.toString(), 4);
            } catch (error) {
              console.log(error);
              errorOccured = true;
            }
          }
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        try {
          if (this.state.userDeposit !== "") {
            userMargin = this.state.userDeposit;
          } else {
            userMargin = ethers.formatUnits(
              (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
              6
            );
          }
          localStorage.setItem("userMargin", JSON.stringify(userMargin));
          console.log(localStorage);
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        userWETHToUSDC =
          userWETHToUSDC !== ""
            ? ethers.formatUnits(userWETHToUSDC.toString(), 6)
            : "";
        userAllInUSDC =
          userAllInUSDC !== ""
            ? ethers.formatUnits(userAllInUSDC.toString(), 6)
            : "";
        userDEBT =
          userDEBT !== "" ? ethers.formatUnits(userDEBT.toString(), 6) : "";

        this.setState({
          userAmountBorrowTRA: "",
          currentAvailable: balanceUser_TRA,
          userWETHToUSDC: userWETHToUSDC,
          userAllInUSDC: userAllInUSDC,
          userMargin: userMargin,
          userHF: userHF,
          currentMarginLevel: currentMarginLevel,
          userEntryPrice: "",
          userLiquidityPrice: userLiquidityPrice,
          userDifference: "",
          userDEBT: userDEBT,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        } else {
          this.onToastUser("Ok", false);
        }
      } catch (error) {
        console.log(error);
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async updatePositionWETH() {
    if (this.state.userAccount !== "") {
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        const SwapContract = new ethers.Contract(
          this.addressSC,
          this.abiSC,
          signer
        );
        const RiskManager = new ethers.Contract(
          this.addressRM,
          this.abiRM,
          signer
        );
        let userWETH = "",
          userAllInUSDC = "",
          userDeposit = "",
          userHF = "NO DEBT",
          currentMarginLevel = "NO DEBT",
          userDEBT = "",
          userLiquidityPrice = "NO DEBT",
          userWETHToUSDC = "";

        // Обновление состояния переменных

        try {
          // Доступные WETH трейдера на TRA
          userWETH = await TraderAccount.getUserBalanceWEther();
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        try {
          // Доступные USDC трейдера на TRA без долга
          userDeposit = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        try {
          // Все токены трейдера, оцененные в USDC, на TRA
          userAllInUSDC = await TraderAccount.getAccountValueInUSDC.staticCall(
            this.state.userAccount
          );

          // Долг трейдера на TRA
          userDEBT = await TraderAccount.getUserDebt();

          // Доступные WETH трейдера, оцененные в USDC, на TRA
          userWETHToUSDC = await SwapContract.quoteWETHToUSDC.staticCall(userWETH);

          // Расчет HF и LiquidityPrice только для пользователя с долгом
          if (ethers.formatUnits(userDEBT, 6) !== "0.0") {
            try {
              let HF_eliminate = await RiskManager.HF_ELIMINATE();
              userHF = await TraderAccount.getHF.staticCall(this.state.userAccount);

              if (userDEBT > ethers.parseUnits(userDeposit, 6)) {
                userLiquidityPrice = '0';
                if (userHF > ethers.parseUnits("0", 0)) {
                  userLiquidityPrice = (userAllInUSDC * HF_eliminate) / userHF;
                }
                userLiquidityPrice = ethers.formatUnits(
                  userLiquidityPrice.toString(),
                  6
                );

                currentMarginLevel = userHF - ethers.parseUnits("1", 4);
                currentMarginLevel = ethers.formatUnits(
                  currentMarginLevel.toString(),
                  2
                );
              } else {
                if (ethers.formatUnits(userWETHToUSDC, 6) === "0.0") {
                  userLiquidityPrice = "Swap some USDC";
                } else {
                  userLiquidityPrice = "Debt is less than your deposit";
                }
              }

              userHF = ethers.formatUnits(userHF.toString(), 4);
            } catch (error) {
              console.log(error);
              errorOccured = true;
            }
          }
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        //userMargin = ethers.formatUnits(userMargin.toString(), 6);
        userWETHToUSDC =
          userWETHToUSDC !== ""
            ? ethers.formatUnits(userWETHToUSDC.toString(), 6)
            : "";
        userAllInUSDC =
          userAllInUSDC !== ""
            ? ethers.formatUnits(userAllInUSDC.toString(), 6)
            : "";
        userDEBT =
          userDEBT !== "" ? ethers.formatUnits(userDEBT.toString(), 6) : "";

        this.setState({
          userWETHToUSDC: userWETHToUSDC,
          userAllInUSDC: userAllInUSDC,
          //userMargin: userMargin,
          userDeposit: userDeposit,
          userHF: userHF,
          currentMarginLevel: currentMarginLevel,
          userEntryPrice: "",
          userLiquidityPrice: userLiquidityPrice,
          userDifference: "",
          userDEBT: userDEBT,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        }
      } catch (error) {
        console.log(error);
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured, position", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async repayUSDCToTraderAccount() {
    if (this.state.userAccount !== "") {
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        await TraderAccount.transferDebtToCA();

        // Обновление состояния переменных

        let balanceUser_TRA = "";
        try {
          // Доступные USDC трейдера на TRA
          balanceUser_TRA = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDC()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        let userWETH = "",
          userAllInUSDC = "",
          userMargin = "",
          userDeposit = "",
          userHF = "NO DEBT",
          currentMarginLevel = "NO DEBT",
          userLiquidityPrice = "NO DEBT",
          userWETHToUSDC = "",
          userDEBT = "";
        const SwapContract = new ethers.Contract(
          this.addressSC,
          this.abiSC,
          signer
        );
        const RiskManager = new ethers.Contract(
          this.addressRM,
          this.abiRM,
          signer
        );
        try {
          // Доступные WETH трейдера на TRA
          userWETH = await TraderAccount.getUserBalanceWEther();
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC трейдера на TRA без долга
          userDeposit = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        // Сумма USDC трейдера в TRA на момент взятия долга
        userMargin = "0.0";
        localStorage.setItem("userMargin", JSON.stringify(userMargin));
        console.log(localStorage);

        try {
          // Все токены трейдера, оцененные в USDC, на TRA
          userAllInUSDC = await TraderAccount.getAccountValueInUSDC.staticCall(
            this.state.userAccount
          );

          // Долг трейдера на TRA
          userDEBT = await TraderAccount.getUserDebt();

          // Доступные WETH трейдера, оцененные в USDC, на TRA
          userWETHToUSDC = await SwapContract.quoteWETHToUSDC.staticCall(userWETH);

          // Расчет HF и LiquidityPrice только для пользователя с долгом
          if (ethers.formatUnits(userDEBT, 6) !== "0.0") {
            try {
              let HF_eliminate = await RiskManager.HF_ELIMINATE();
              console.log(HF_eliminate);
              userHF = await TraderAccount.getHF.staticCall(this.state.userAccount);

              if (userDEBT > ethers.parseUnits(this.state.userDeposit, 6)) {
                userLiquidityPrice = (userAllInUSDC * HF_eliminate) / userHF;
                console.log(userLiquidityPrice);
                console.log(userHF);
                console.log(HF_eliminate);
                userLiquidityPrice = ethers.formatUnits(
                  userLiquidityPrice.toString(),
                  6
                );
                currentMarginLevel = userHF - ethers.parseUnits("1", 4);
                currentMarginLevel = ethers.formatUnits(
                  currentMarginLevel.toString(),
                  2
                );
              } else {
                if (ethers.formatUnits(userWETHToUSDC, 6) === "0.0") {
                  userLiquidityPrice = "Swap some USDC";
                } else {
                  userLiquidityPrice = "Debt is less than your deposit";
                }
              }

              userHF = ethers.formatUnits(userHF.toString(), 4);
            } catch (error) {
              console.log(error);
              errorOccured = true;
            }
          }
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        //userMargin = ethers.formatUnits(userMargin.toString(), 6);
        userWETHToUSDC =
          userWETHToUSDC !== ""
            ? ethers.formatUnits(userWETHToUSDC.toString(), 6)
            : "";
        userAllInUSDC =
          userAllInUSDC !== ""
            ? ethers.formatUnits(userAllInUSDC.toString(), 6)
            : "";
        userDEBT =
          userDEBT !== "" ? ethers.formatUnits(userDEBT.toString(), 6) : "";

        this.setState({
          userAmountBorrowTRA: "",
          currentAvailable: balanceUser_TRA,
          userWETHToUSDC: userWETHToUSDC,
          userAllInUSDC: userAllInUSDC,
          userMargin: userMargin,
          userDeposit: userDeposit,
          userHF: userHF,
          currentMarginLevel: currentMarginLevel,
          userEntryPrice: "",
          userLiquidityPrice: userLiquidityPrice,
          userDifference: "",
          userDEBT: userDEBT,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        } else {
          this.onToastUser("Ok", false);
        }
      } catch (error) {
        console.log(error);
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async withdrawUSDCFromTraderAccount() {
    if (this.state.userAccount !== "") {
      if (this.state.userAmountSendTRA === "") {
        console.log("Empty amount");
        return;
      }
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const USDCContract = new ethers.Contract(
          this.addressUSDC,
          this.abiUSDC,
          signer
        );
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        await TraderAccount.withdrawUSDC(
          ethers.parseUnits(this.state.userAmountSendTRA, 6)
        );

        // Обновление состояния переменных

        let balanceUser = "",
          balanceUser_TRA = "";
        try {
          // Доступные USDC MetaMask
          balanceUser = ethers.formatUnits(
            (await USDCContract.balanceOf(this.state.userAccount)).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC трейдера на TRA
          balanceUser_TRA = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDC()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        let userWETH = "",
          userAllInUSDC = "",
          //userMargin = "",
          userDeposit = "",
          userHF = "NO DEBT",
          currentMarginLevel = "NO DEBT",
          userLiquidityPrice = "NO DEBT",
          userWETHToUSDC = "",
          userDEBT = "";
        const SwapContract = new ethers.Contract(
          this.addressSC,
          this.abiSC,
          signer
        );
        const RiskManager = new ethers.Contract(
          this.addressRM,
          this.abiRM,
          signer
        );
        try {
          // Доступные WETH трейдера на TRA
          userWETH = await TraderAccount.getUserBalanceWEther();
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC трейдера на TRA без долга
          userDeposit = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        try {
          // Все токены трейдера, оцененные в USDC, на TRA
          userAllInUSDC = await TraderAccount.getAccountValueInUSDC.staticCall(
            this.state.userAccount
          );

          //userMargin = await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall();

          // Долг трейдера на TRA
          userDEBT = await TraderAccount.getUserDebt();

          // Доступные WETH трейдера, оцененные в USDC, на TRA
          userWETHToUSDC = await SwapContract.quoteWETHToUSDC.staticCall(userWETH);

          // Расчет HF и LiquidityPrice только для пользователя с долгом
          if (ethers.formatUnits(userDEBT, 6) !== "0.0") {
            try {
              let HF_eliminate = await RiskManager.HF_ELIMINATE();
              console.log(HF_eliminate);
              userHF = await TraderAccount.getHF.staticCall(this.state.userAccount);

              if (userDEBT > ethers.parseUnits(this.state.userDeposit, 6)) {
                userLiquidityPrice = (userAllInUSDC * HF_eliminate) / userHF;
                console.log(userLiquidityPrice);
                console.log(userHF);
                console.log(HF_eliminate);
                userLiquidityPrice = ethers.formatUnits(
                  userLiquidityPrice.toString(),
                  6
                );
                currentMarginLevel = userHF - ethers.parseUnits("1", 4);
                currentMarginLevel = ethers.formatUnits(
                  currentMarginLevel.toString(),
                  2
                );
              } else {
                if (ethers.formatUnits(userWETHToUSDC, 6) === "0.0") {
                  userLiquidityPrice = "Swap some USDC";
                } else {
                  userLiquidityPrice = "Debt is less than your deposit";
                }
              }

              userHF = ethers.formatUnits(userHF.toString(), 4);
            } catch (error) {
              console.log(error);
              errorOccured = true;
            }
          }
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        //userMargin = ethers.formatUnits(userMargin.toString(), 6);
        userWETHToUSDC =
          userWETHToUSDC !== ""
            ? ethers.formatUnits(userWETHToUSDC.toString(), 6)
            : "";
        userAllInUSDC =
          userAllInUSDC !== ""
            ? ethers.formatUnits(userAllInUSDC.toString(), 6)
            : "";
        userDEBT =
          userDEBT !== "" ? ethers.formatUnits(userDEBT.toString(), 6) : "";

        this.setState({
          userAmountBorrowTRA: "",
          balanceUser: balanceUser,
          currentAvailable: balanceUser_TRA,
          userWETHToUSDC: userWETHToUSDC,
          userAllInUSDC: userAllInUSDC,
          //userMargin: userMargin,
          userDeposit: userDeposit,
          userHF: userHF,
          currentMarginLevel: currentMarginLevel,
          userEntryPrice: "",
          userLiquidityPrice: userLiquidityPrice,
          userDifference: "",
          userDEBT: userDEBT,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        } else {
          this.onToastUser("Ok", false);
        }
      } catch (error) {
        console.log(error);
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async swapTokens() {
    if (this.state.userAccount !== "") {
      if (this.state.userAmountExchangeTRA === "") {
        console.log("Empty amount");
        return;
      }
      let errorOccured = false;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const TraderAccount = new ethers.Contract(
          this.addressTRA,
          this.abiTRA,
          signer
        );
        const SwapContract = new ethers.Contract(
          this.addressSC,
          this.abiSC,
          signer
        );
        let quote = "",
          swapAmountOut = "";

        // В зависимости от вида swap своя функция
        if (this.state.typeOfSwap === "0") {
          quote = "0";
          swapAmountOut = await TraderAccount.swapUSDCToWETH(
            ethers.parseUnits(this.state.userAmountExchangeTRA, 6),
            ethers.parseUnits(quote, 0)
          );
          let iface = new ethers.Interface(this.abiSC);
          const event = iface.parseTransaction({
            data: swapAmountOut.data,
            value: swapAmountOut.value,
          });
          console.log("getAmountOUT", event);
          // console.log(ethers.AbiCoder.defaultAbiCoder().decode(['uint256'],ethers.dataSlice(swapAmountOut.data,0,32)));
        } else {
          quote = "0";
          swapAmountOut = await TraderAccount.swapWETHToUSDC(
            ethers.parseUnits(this.state.userAmountExchangeTRA, 18),
            ethers.parseUnits(quote, 0)
          );
        }

        // Обновление состояния переменных

        let balanceUser_TRA = "",
          balanceUser_TRA_WETH = "";
        try {
          // Доступные USDC трейдера на TRA
          balanceUser_TRA = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDC()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные WETH трейдера на TRA
          balanceUser_TRA_WETH = ethers.formatUnits(
            (await TraderAccount.getUserBalanceWEther()).toString(),
            18
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        let userWETH = "",
          userAllInUSDC = "",
          //userMargin = "",
          userDeposit = "",
          userHF = "NO DEBT",
          currentMarginLevel = "NO DEBT",
          userLiquidityPrice = "NO DEBT",
          userWETHToUSDC = "",
          userDEBT = "";
        const RiskManager = new ethers.Contract(
          this.addressRM,
          this.abiRM,
          signer
        );

        try {
          // Доступные WETH трейдера на TRA
          userWETH = await TraderAccount.getUserBalanceWEther();
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }
        try {
          // Доступные USDC трейдера на TRA без долга
          userDeposit = ethers.formatUnits(
            (await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall()).toString(),
            6
          );
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        try {
          // Все токены трейдера, оцененные в USDC, на TRA
          userAllInUSDC = await TraderAccount.getAccountValueInUSDC.staticCall(
            this.state.userAccount
          );

          //userMargin = await TraderAccount.getUserBalanceUSDCWithoutDebt.staticCall();

          // Долг трейдера на TRA
          userDEBT = await TraderAccount.getUserDebt();

          // Доступные WETH трейдера, оцененные в USDC, на TRA
          userWETHToUSDC = await SwapContract.quoteWETHToUSDC.staticCall(userWETH);

          // Расчет HF и LiquidityPrice только для пользователя с долгом
          if (ethers.formatUnits(userDEBT, 6) !== "0.0") {
            try {
              let HF_eliminate = await RiskManager.HF_ELIMINATE();
              console.log(HF_eliminate);
              userHF = await TraderAccount.getHF.staticCall(this.state.userAccount);

              if (userDEBT > ethers.parseUnits(this.state.userDeposit, 6)) {
                userLiquidityPrice = (userAllInUSDC * HF_eliminate) / userHF;
                console.log(userLiquidityPrice);
                console.log(userHF);
                console.log(HF_eliminate);
                userLiquidityPrice = ethers.formatUnits(
                  userLiquidityPrice.toString(),
                  6
                );
                currentMarginLevel = userHF - ethers.parseUnits("1", 4);
                currentMarginLevel = ethers.formatUnits(
                  currentMarginLevel.toString(),
                  2
                );
              } else {
                if (ethers.formatUnits(userWETHToUSDC, 6) === "0.0") {
                  userLiquidityPrice = "Swap some USDC";
                } else {
                  userLiquidityPrice = "Debt is less than your deposit";
                }
              }

              userHF = ethers.formatUnits(userHF.toString(), 4);
            } catch (error) {
              console.log(error);
              errorOccured = true;
            }
          }
        } catch (error) {
          console.log(error);
          errorOccured = true;
        }

        //userMargin = ethers.formatUnits(userMargin.toString(), 6);
        userWETHToUSDC =
          userWETHToUSDC !== ""
            ? ethers.formatUnits(userWETHToUSDC.toString(), 6)
            : "";
        userAllInUSDC =
          userAllInUSDC !== ""
            ? ethers.formatUnits(userAllInUSDC.toString(), 6)
            : "";
        userDEBT =
          userDEBT !== "" ? ethers.formatUnits(userDEBT.toString(), 6) : "";

        this.setState({
          userAmountExchangeTRA: "",
          currentAvailable: balanceUser_TRA,
          currentAvailableWETH: balanceUser_TRA_WETH,
          userWETHToUSDC: userWETHToUSDC,
          userAllInUSDC: userAllInUSDC,
          //userMargin: userMargin,
          userDeposit: userDeposit,
          userHF: userHF,
          currentMarginLevel: currentMarginLevel,
          userEntryPrice: "",
          userLiquidityPrice: userLiquidityPrice,
          userDifference: "",
          userDEBT: userDEBT,
        });

        if (errorOccured) {
          this.onToastUser("Error when updated, refresh recommended", true);
        } else {
          this.onToastUser("Ok", false);
        }
      } catch (error) {
        console.log(error);
        if (error.revert) {
          this.onToastUser(error.revert.args[0], true);
        } else {
          this.onToastUser("Error occured", true);
        }
      }
    } else {
      console.log("Connect MetaMask!");
    }
  }

  async reloadDataTraderBalance() {
      if (this.state.userAccount !== "") {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const TraderAccountContract = new ethers.Contract(
              this.addressTRA,
              this.abiTRA,
              signer
          );
          try {
              this.setState({ 
                currentAvailableWETH: ethers.formatUnits((await TraderAccountContract.getUserBalanceWEther()).toString(), 18),
                currentAvailable: ethers.formatUnits((await TraderAccountContract.getUserBalanceUSDC()).toString(), 6) 
              });
          } catch (err) {
              console.log(err.message);
              // this.onToastUser("Failed to send USDC to the Liquidity pool!", true);
          }
      } else {
          console.log("Connect MetaMask!");
      }
  }

  async componentDidMount() {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      this.setState({ userAccount: accounts[0] });
      this.getCurrentQuoteWETHToUSDC();
      // this.getCurrentMarginLevel();
      this.getCurrentAvailable();
      this.getCurrentAvailableWETH();
      this.getUserBalanceUSDC();
      this.getUserMargin();
      this.updatePositionWETH();
      setInterval(() => this.getCurrentQuoteWETHToUSDC(), 5000);
      setInterval(() => this.reloadDataTraderBalance(), 6000);
      setInterval(() => this.updatePositionWETH(), 5000);
    } else {
      console.log("Connect MetaMask!");
    }
  }

  render() {
    return (
      <>
        <Container
          className="d-flex justify-content-center align-items-center"
          style={{ height: "110vh" }}
        >
          <Row className="d-flex justify-content-center align-items-center">
            <Row
              style={{
                border: "2px solid #333",
                flexDirection: "row",
              }}
            >
              <Col className="text-start" style={{ marginTop: "15px" }}>
                <p>
                  Current price:{" "}
                  {this.state.currentWETHQuote ? (
                    <strong>{"$ " + this.state.currentWETHQuote}</strong>
                  ) : (
                    <></>
                  )}
                </p>
              </Col>
              <Col className="text-end" style={{ marginTop: "15px" }}>
                <p>
                  Margin level:{" "}
                  {this.state.currentMarginLevel &&
                  this.state.currentMarginLevel !== "NO DEBT" ? (
                    <strong>{this.state.currentMarginLevel + " %"}</strong>
                  ) : (
                    <></>
                  )}
                </p>
              </Col>
            </Row>
            <Row
              className="d-flex justify-content-center align-items-center"
              style={{ marginTop: "15px" }}
            >
              <div
                className="rectangle"
                style={{
                  height: "420px",
                  width: "550px",
                  border: "2px solid #333",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Row className="text-center" style={{ marginTop: "15px" }}>
                  <strong>BORROW USDC</strong>
                </Row>

                <Row className="button-row" style={{ marginTop: "15px" }}>
                  <Col className="text-end">
                    <Button
                      onClick={() => this.onShowBorrow(0)}
                      variant={
                        this.state.showBorrow === 0 ? "dark" : "secondary"
                      }
                      style={{ width: "150px" }}
                    >
                      Deposit
                    </Button>
                  </Col>
                  <Col className="text-center">
                    <Button
                      onClick={() => this.onShowBorrow(1)}
                      variant={
                        this.state.showBorrow === 1 ? "dark" : "secondary"
                      }
                      style={{ width: "150px" }}
                    >
                      Debt
                    </Button>
                  </Col>
                  <Col className="text-start">
                    <Button
                      onClick={() => this.onShowBorrow(2)}
                      variant={
                        this.state.showBorrow === 2 ? "dark" : "secondary"
                      }
                      style={{ width: "150px" }}
                    >
                      Exchange
                    </Button>
                  </Col>
                </Row>
                <Row
                  className="d-flex justify-content-center align-items-center"
                  style={{ marginTop: "40px" }}
                >
                  {this.state.showBorrow === 2 ? (
                    <>
                      <Row
                        className="button-row"
                        style={{ marginBottom: "15px" }}
                      >
                        <Col>
                          <Form.Control
                            onChange={this.handleInputChange}
                            type="text"
                            placeholder="Amount "
                            value={this.state.userAmountExchangeTRA}
                          />
                        </Col>
                        <Col>
                          <Form.Select
                            value={this.state.typeOfSwap}
                            onChange={this.handleSwapChange}
                          >
                            <option value={"0"}>USDC to WETH</option>
                            <option value={"1"}>WETH to USDC</option>
                          </Form.Select>
                        </Col>
                      </Row>
                      <Row
                        className="button-row"
                        style={{ marginBottom: "15px" }}
                      >
                        <Col className="text-start">Available USDC:</Col>
                        <Col className="text-end">
                          {this.state.currentAvailable ? (
                            <>{this.state.currentAvailable + " USDC"}</>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                      <Row
                        className="button-row"
                        style={{ marginBottom: "15px" }}
                      >
                        <Col className="text-start">Available WETH:</Col>
                        <Col className="text-end">
                          {this.state.currentAvailableWETH ? (
                            <>{this.state.currentAvailableWETH + " WETH"}</>
                          ) : (
                            <></>
                          )}
                        </Col>
                      </Row>
                      <Row
                        className="button-row"
                        style={{ marginBottom: "15px" }}
                      >
                        <Col className="text-start">Fees:</Col>
                        <Col className="text-end">5 %</Col>
                      </Row>
                      <Row
                        className="button-row"
                        style={{ marginBottom: "15px" }}
                      >
                        <Button onClick={this.swapTokens} variant="dark">
                          SWAP
                        </Button>
                      </Row>
                    </>
                  ) : (
                    <>
                      {this.state.showBorrow === 1 ? (
                        <>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Form.Control
                              onChange={this.handleInputChange}
                              type="text"
                              placeholder="Amount (USDC)"
                              value={this.state.userAmountBorrowTRA}
                              // style={{ width: "100%" }}
                            />
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Available:</Col>
                            <Col className="text-end">
                              {this.state.currentAvailable ? (
                                <>{this.state.currentAvailable + " USDC"}</>
                              ) : (
                                <></>
                              )}
                            </Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Your deposit:</Col>
                            <Col className="text-end">
                              {this.state.userDeposit ? (
                                <>{this.state.userDeposit + " USDC"}</>
                              ) : (
                                <></>
                              )}
                            </Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Borrow APY:</Col>
                            <Col className="text-end">5 %</Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Button
                              onClick={this.borrowUSDCFromTraderAccount}
                              variant="dark"
                            >
                              BORROW
                            </Button>
                          </Row>
                        </>
                      ) : (
                        <>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Form.Control
                              onChange={this.handleInputChange}
                              type="text"
                              placeholder="Amount (USDC)"
                              value={this.state.userAmountSendTRA}
                              // style={{ width: "100%" }}
                            />
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Balance:</Col>
                            <Col className="text-end">
                              {this.state.userAccount ? (
                                <>{this.state.balanceUser + " USDC"}</>
                              ) : (
                                <></>
                              )}
                            </Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Your deposit:</Col>
                            <Col className="text-end">
                              {this.state.userDeposit ? (
                                <>{this.state.userDeposit + " USDC"}</>
                              ) : (
                                <></>
                              )}
                            </Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Col className="text-start">Borrow APY:</Col>
                            <Col className="text-end">5 %</Col>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Button
                              onClick={this.sendUSDCToTraderAccount}
                              variant="dark"
                            >
                              DEPOSIT
                            </Button>
                          </Row>
                          <Row
                            className="button-row"
                            style={{ marginBottom: "15px" }}
                          >
                            <Button
                              onClick={this.withdrawUSDCFromTraderAccount}
                              variant="secondary"
                            >
                              WITHDRAW
                            </Button>
                          </Row>
                        </>
                      )}
                    </>
                  )}
                </Row>
              </div>
            </Row>
            <Row
              style={{
                border: "2px solid #333",
                flexDirection: "row",
                marginTop: "15px",
              }}
            >
              {/* <Col>Position</Col> */}
              <Col
                className="text-center"
                style={{ marginTop: "15px", marginBottom: "15px" }}
              >
                <Row>Position</Row>
                <Row>Long</Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Asset</Row>
                <Row>ETH</Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>WETH</Row>
                {/* {quoteWETHToUSDC(getTraderWETH)} */}
                <Row>{this.state.userWETHToUSDC}</Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Margin</Row>
                {/* {getUserBalanceUSDCWithoutDebt} */}
                <Row>
                  {this.state.userMargin !== "" && this.state.userDEBT !== ""
                    ? this.state.userDEBT !== "0.0"
                      ? "$ " + this.state.userMargin
                      : "$ 0.0"
                    : ""}
                </Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Debt</Row>
                {/* {getUserBalanceUSDCWithoutDebt} */}
                <Row>
                  {this.state.userDEBT !== ""
                    ? "$ " + this.state.userDEBT
                    : this.state.userDEBT}
                </Row>
              </Col>
              {/* <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Entry price</Row>
                {/* {price of buying WETH}  <Row>ETH</Row></Col> */}
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>HF</Row>
                {/* {HF value} */}
                <Row>{this.state.userHF}</Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Liquidity price</Row>
                {/* {price when eliminating} */}
                <Row>{this.state.userLiquidityPrice}</Row>
              </Col>
              {/* <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>Difference</Row>
                {/* {(current WETH price - Entry price) * WETH} 
                <Row>ETH</Row>
              </Col>
              <Col className="text-center" style={{ marginTop: "15px" }}>
                <Row>USDC</Row>
                {/* {Debt} 
                <Row>
                  {this.state.currentMarginLevel ? (
                    <strong>{this.state.currentMarginLevel + " %"}</strong>
                  ) : (
                    <></>
                  )}
                </Row>
              </Col> */}
              <Col>
                <Row
                  className="button-row"
                  style={{ marginTop: "20px", marginLeft: "15px" }}
                >
                  <Button
                    onClick={this.repayUSDCToTraderAccount}
                    variant="secondary"
                  >
                    REPAY
                  </Button>
                </Row>
              </Col>
            </Row>
          </Row>
        </Container>
      </>
    );
  }
}

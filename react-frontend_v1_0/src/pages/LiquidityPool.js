import React, { Component } from "react";
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import logoLiquidityPool from "./LogoLiquidityPool.png";
import { ethers } from "ethers";

export default class LiquidityPool extends Component {

    constructor() {
        super();

        this.state = {
            approveInterval: null,      // Используется для проверки одобрения транзакции на перевод контрактом LP
            history: null,              // Добавляет переход на просмотр контракта Liquidity pool
            balanceUser: "0",           // Баланс на кошельке пользователя
            hiddenDeposit: false,        // Переключатель для показа формы внесения депозита
            hiddenWithdraw: false,       // Переключатель для показа формы вывода депозита
            deposit: "0",               // Сейчас деньги пользователя, которые он перевел в Liquidity pool
            annualPercentageRate: "15", // Примерная процентная ставка дохода от вложенных средств
            totalMoney: "",             // Всего денег на контракте Liquidity pool
            totalTrade: "",             // Всего денег на контракте в данный момент заблокировано (торгуется)
            userAccount: "",            // Адрес кошелька, с которым происходит взаимодействие 
            userAmountSend: ""          // Сколько пользователь готов внести в Liquidity pool
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

        // Делаем привязку к функции контекста this
        this.onClose = this.onClose.bind(this);
        this.onHiddenDeposit = this.onHiddenDeposit.bind(this);
        this.onHiddenWithdraw = this.onHiddenWithdraw.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.getUserBalanceUSDC = this.getUserBalanceUSDC.bind(this);
        this.onAddAllBalanceUser = this.onAddAllBalanceUser.bind(this);
        this.reloadDataLiquidityPool = this.reloadDataLiquidityPool.bind(this);
        this.getTotalMoneyLiquidityPool = this.getTotalMoneyLiquidityPool.bind(this);
        this.sendDepositToLiquidityPool = this.sendDepositToLiquidityPool.bind(this);
        this.getUserBalanceLiquidityPool = this.getUserBalanceLiquidityPool.bind(this);
        this.sendWithdrawToLiquidityPool = this.sendWithdrawToLiquidityPool.bind(this);
        this.getTotalTradedCentralAccount = this.getTotalTradedCentralAccount.bind(this);
        this.sendUSDCLiquidityPoolToCentralAccount = this.sendUSDCLiquidityPoolToCentralAccount.bind(this);
    }

    onToastUser(messageUser, negative) {
        if (negative === true) {
            alert('Negative: ' + messageUser);
        } else {
            alert('Positive: ' + messageUser);
        }
    }

    onRedirectToLP (urlAddress) {
        window.location.replace(urlAddress);
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
        return answer + " USDC";
    }

    formatMoney(strMoney, decimals) {
        if (strMoney === "0" || strMoney === "") {
            return "0";
        }
        let answer = "", decimalsView = 2;
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
            answer = strMoney[i] + answer;
        }
        return answer;
    }

    handleInputChange(event) {
        let newValue = event.target.value;

        if (newValue === '.') {
            newValue = '0' + newValue;
        }

        newValue = newValue.replace(/[^0-9.]/g, '');

        const dotCount = (newValue.match(/\./g) || []).length;
        if (dotCount > 1) {
            return;
        }

        const dotIndex = newValue.indexOf('.');
        if (dotIndex !== -1 && newValue.length - dotIndex > 7) {
            return;
        }

        this.setState({ userAmountSend: newValue });
    }

    onClose() {
        this.setState({ hiddenDeposit: false });
        this.setState({ hiddenWithdraw: false });
    }

    onAddAllBalanceUser() {
        if (this.state.hiddenDeposit === true) {
            this.setState({ userAmountSend: ethers.formatUnits(this.state.balanceUser, 6) });
        } else {
            this.setState({ userAmountSend: ethers.formatUnits(this.state.deposit, 6) });
        }

    }

    async onHiddenDeposit() {
        if (this.state.hiddenDeposit === true) {
            await this.sendDepositToLiquidityPool();
        } else {
            await this.getUserBalanceUSDC();
            await this.getUserBalanceLiquidityPool();
            this.setState({ hiddenDeposit: true });
        }
    }

    async onHiddenWithdraw() {
        if (this.state.hiddenWithdraw === true) {
            await this.sendWithdrawToLiquidityPool();
            this.setState({ hiddenWithdraw: false });
        } else {
            await this.getUserBalanceUSDC();
            await this.getUserBalanceLiquidityPool();
            this.setState({ hiddenWithdraw: true });
        }
    }

    async sendUSDCLiquidityPoolToCentralAccount() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const liquidityPoolContract = new ethers.Contract(
                this.addressLP,
                this.abiLP,
                signer
            );
            try {
                await liquidityPoolContract.transferToLP(ethers.parseUnits(this.state.userAmountSend, 6));
                this.setState({ deposit: (await liquidityPoolContract.getUserBalance()).toString() });
                clearInterval(this.state.approveInterval);
                this.setState({ approveInterval: null});
                this.setState({ hiddenDeposit: false });
                this.onToastUser("The transfer transaction has been sent by the contract, wait for it to be completed!", false);
            } catch (err) {
                console.log(err.message);
                // this.onToastUser("Failed to send USDC to the Liquidity pool!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendDepositToLiquidityPool() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const USDCContract = new ethers.Contract(
                this.addressUSDC,
                this.abiUSDC,
                signer
            );
            try {
                await USDCContract.approve(this.addressLP, ethers.parseUnits(this.state.userAmountSend, 6));
                this.setState({ approveInterval: setInterval(() => this.sendUSDCLiquidityPoolToCentralAccount(), 10000)});
            } catch (err) {
                console.log(err.message);
                this.onToastUser("Failed to send USDC to the Liquidity pool!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendWithdrawToLiquidityPool() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const liquidityPoolContract = new ethers.Contract(
                this.addressLP,
                this.abiLP,
                signer
            );
            try {
                await liquidityPoolContract.withdraw(ethers.parseUnits(this.state.userAmountSend, 6));
                this.setState({ deposit: (await liquidityPoolContract.getUserBalance()).toString() });
            } catch (err) {
                console.log(err.message);
                this.onToastUser("The USDC could not be withdrawn from the Liquidity pool! More detailed information is available in the console.", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getUserBalanceUSDC() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const USDCContract = new ethers.Contract(
                this.addressUSDC,
                this.abiUSDC,
                provider
            );
            try {
                this.setState({ balanceUser: (await USDCContract.balanceOf(this.state.userAccount)).toString() });
            } catch (err) {
                console.log(err.message);
                this.onToastUser("It was not possible to get your current balance in the USDC!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getUserBalanceLiquidityPool() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const liquidityPoolContract = new ethers.Contract(
                this.addressLP,
                this.abiLP,
                signer
            );
            try {
                this.setState({ deposit: (await liquidityPoolContract.getUserBalance()).toString() });
            } catch (err) {
                console.log(err.message);
                this.onToastUser("It was not possible to get your current USDC balance from the Liquidity pool contract!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getTotalMoneyLiquidityPool() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const liquidityPoolContract = new ethers.Contract(
                this.addressLP,
                this.abiLP,
                provider
            );
            try {
                this.setState({ totalMoney: (await liquidityPoolContract.balanceX()).toString() });
            } catch (err) {
                console.log(err.message);
                this.onToastUser("Failed to get the total amount of USDC in the Liquidity pool!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async getTotalTradedCentralAccount() {
        if (this.state.userAccount !== "") {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const centralAccountContract = new ethers.Contract(
                this.addressCA,
                this.abiCA,
                provider
            );
            try {
                this.setState({ totalTrade: (await centralAccountContract.countUSDCTraders()).toString() });
            } catch (err) {
                console.log(err.message);
                this.onToastUser("It was not possible to get the total number of USDC that Traders are currently using!", true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async reloadDataLiquidityPool() {
        await this.getUserBalanceLiquidityPool();
        await this.getTotalMoneyLiquidityPool();
        await this.getTotalTradedCentralAccount();
    }

    async componentDidMount() {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            this.setState({ userAccount: accounts[0] });
            this.reloadDataLiquidityPool();
            setInterval(() => this.reloadDataLiquidityPool(), 10000);
        } else {
            console.log("Connect MetaMask!");
        }
    }

    render() {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '110vh' }}>
                <div style={{ position: 'relative' }}>
                    {this.state.hiddenDeposit === false && this.state.hiddenWithdraw === false ? (
                        <div
                            className="rectangle"
                            style={{
                                height: '420px',
                                width: '450px',
                                border: '2px solid #333',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Row className="text-center" style={{ marginTop: '15px' }}>
                                <Col>
                                    <img
                                        src={logoLiquidityPool}
                                        height="80"
                                        width="100"
                                        className="d-inline-block align-top"
                                        alt="Logo"
                                    />
                                </Col>
                            </Row>
                            <Row className="text-center" style={{ marginTop: '15px' }}>
                                <Col>
                                    <Button onClick={() => this.onRedirectToLP("https://arbiscan.io/address/0x72822AfF9158df12ab95647126fC9D9B7689c06b")} variant="outline-dark" style={{ width: '250px', paddingTop: '10px' }}><h5>LIQUIDITY POOL</h5></Button>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginTop: '15px' }}>
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Your deposit: <strong>{this.formatMoneyUser(this.state.deposit, true)}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row">
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Total APR ≈ <strong>{this.state.annualPercentageRate} %</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row">
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Total money: <strong>{this.formatMoneyUser(this.state.totalMoney, false)}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Total traded: <strong>{this.formatMoneyUser(this.state.totalTrade, false)}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-end">
                                    <Button onClick={this.onHiddenDeposit} variant="dark" style={{ width: '150px' }}>Deposit</Button>
                                </Col>
                                <Col className="text-start">
                                    <Button onClick={this.onHiddenWithdraw} variant="secondary" style={{ width: '150px' }}>Withdraw</Button>
                                </Col>
                            </Row>
                        </div>
                    ) : (this.state.hiddenDeposit === true ? (
                        <div
                            className="rectangle"
                            style={{
                                height: '420px',
                                width: '450px',
                                border: '2px solid #333',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Row className="button-row">
                                <Col className="text-end" style={{ marginRight: '5px' }}>
                                    <p onClick={this.onClose} style={{ cursor: 'pointer' }}>[X]</p>
                                </Col>
                            </Row>
                            <Row className="text-center" style={{ marginTop: '-25px' }}>
                                <Col>
                                    <img
                                        src={logoLiquidityPool}
                                        height="80"
                                        width="100"
                                        className="d-inline-block align-top"
                                        alt="Logo"
                                    />
                                </Col>
                            </Row>
                            <Row className="text-center" style={{ marginTop: '15px', marginBottom: '25px' }}>
                                <Col>
                                    {/* Добавить ссылку на Ether scan  */}
                                    <Button variant="outline-dark" style={{ width: '250px', paddingTop: '10px' }}><h5>LIQUIDITY POOL</h5></Button>
                                </Col>
                            </Row>
                            <Row className="button-row">
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Current deposit: <strong>{ethers.formatUnits(this.state.deposit, 6) + ' USDC'}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Your balance: <strong>{this.formatMoneyUser(this.state.balanceUser, true)}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '15px' }}>
                                <Col className="text-end">
                                    <Form.Control onChange={this.handleInputChange} type="text" placeholder="Enter amount or" value={this.state.userAmountSend} style={{ width: '100%', marginLeft: '45px' }} />
                                </Col>
                                <Col className="text-end" style={{ marginRight: '45px' }}>
                                    <Button onClick={this.onAddAllBalanceUser} variant="dark" style={{ width: '150px' }}>ADD ALL</Button>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-center">
                                    <Button onClick={this.onHiddenDeposit} variant="dark" style={{ width: '150px' }}>Deposit</Button>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div
                            className="rectangle"
                            style={{
                                height: '420px',
                                width: '450px',
                                border: '2px solid #333',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            <Row className="button-row">
                                <Col className="text-end" style={{ marginRight: '5px' }}>
                                    <p onClick={this.onClose} style={{ cursor: 'pointer' }}>[X]</p>
                                </Col>
                            </Row>
                            <Row className="text-center" style={{ marginTop: '-25px' }}>
                                <Col>
                                    <img
                                        src={logoLiquidityPool}
                                        height="80"
                                        width="100"
                                        className="d-inline-block align-top"
                                        alt="Logo"
                                    />
                                </Col>
                            </Row>
                            <Row className="text-center" style={{ marginTop: '15px', marginBottom: '25px' }}>
                                <Col>
                                    {/* Добавить ссылку на Ether scan  */}
                                    <Button variant="outline-dark" style={{ width: '250px', paddingTop: '10px' }}><h5>LIQUIDITY POOL</h5></Button>
                                </Col>
                            </Row>
                            <Row className="button-row">
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Current deposit: <strong>{ethers.formatUnits(this.state.deposit, 6) + ' USDC'}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-start" style={{ marginLeft: '45px' }}>
                                    <p>Your balance: <strong>{this.formatMoneyUser(this.state.balanceUser, true)}</strong></p>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '15px' }}>
                                <Col className="text-end">
                                    <Form.Control onChange={this.handleInputChange} type="text" placeholder="Enter amount or" value={this.state.userAmountSend} style={{ width: '100%', marginLeft: '45px' }} />
                                </Col>
                                <Col className="text-end" style={{ marginRight: '45px' }}>
                                    <Button onClick={this.onAddAllBalanceUser} variant="dark" style={{ width: '150px' }}>ADD ALL</Button>
                                </Col>
                            </Row>
                            <Row className="button-row" style={{ marginBottom: '5px' }}>
                                <Col className="text-center">
                                    <Button onClick={this.onHiddenWithdraw} variant="dark" style={{ width: '150px' }}>Withdraw</Button>
                                </Col>
                            </Row>
                        </div>
                    )
                    )}
                </div>
            </Container>
        )
    }
}


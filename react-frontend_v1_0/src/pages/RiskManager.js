import React, { Component } from "react";
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { ethers } from "ethers";

export default class RiskManager extends Component {

    constructor() {
        super();

        this.state = {
            hiddenRemove: false,         // Переключатель для показа формы удаления трейдера
            arrHFTraderDelete: [],      // Массив трейдеров для проверки на удаление по HF
            arrDayTraderDelete: [],     // Массив трейдеров для проверки на удаление по Дате
            totalTraders: "",           // Всего трейдеров сейчас торгует
            startNumber: "0",           // Начальное id трейдера
            endNumber: "0",             // Конечный id трейдера
            addressDeleteTrader: "",    // Адрес трейдера подозреваемого на удаление
            userAccount: ""             // Адрес кошелька, с которым происходит взаимодействие 
        };
        
        // Заполняем необходимую информацию по контрактам
        // this.addressRM = "0x484242986f57dfca98eec2c78427931c63f1c4ce"; // В тестовой сети Вероника
        // this.addressRM = "0xa513e6e4b8f2a923d98304ec87f64353c4d5c853"; // В тестовой сети Димитрий
        this.addressRM = "0x971564d99098650D853cD621EBa39F969B896c08"; // В основной сети Арбитрум
        this.abiRM = `[{"inputs":[{"internalType":"address","name":"_TRA","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[],"name":"HF_ELIMINATE","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ITRA","outputs":[{"internalType":"contract ITraderAccount","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"addTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTraders","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_begin","type":"uint256"},{"internalType":"uint256","name":"_end","type":"uint256"}],"name":"checkTradersDay","outputs":[{"internalType":"uint256[]","name":"answer","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_trader","type":"address"}],"name":"deleteTrader","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_traderId","type":"uint256"}],"name":"eliminate","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getCountTraders","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint16","name":"_new_HF_ELIMINATE","type":"uint16"}],"name":"setHFEliminate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;

        // Делаем привязку к функции контекста this
        this.onHiddenRemove = this.onHiddenRemove.bind(this);
        this.getTotalTraders = this.getTotalTraders.bind(this);
        this.getCheckTraders = this.getCheckTraders.bind(this);
        this.formatArrHFTraderDelete = this.formatArrHFTraderDelete.bind(this);
        this.handleEndNumberInputChange = this.handleEndNumberInputChange.bind(this);
        this.handleStartNumberInputChange = this.handleStartNumberInputChange.bind(this);
    }

    onToastUser(messageUser, negative) {
        if (negative === true) {
            alert('Negative: ' + messageUser);
        } else {
            alert('Positive: ' + messageUser);
        }
    }

    formatArrHFTraderDelete(arrHF, arrDay) {
        let check = true, answer = '';
        let startNum = parseInt(this.state.startNumber);
        for (let i = 0; i < arrHF.length; i++) {
            if (check) {
                answer = String(startNum) + ": " + arrHF[i] + "; Day: " + arrDay[i] + ";";
                check = false;
            } else {
                answer = answer + '\n' + String(startNum) + ": " + arrHF[i] + "; Day: " + arrDay[i] + ";";
            }
            startNum++;
        }
        return answer;
    }

    handleStartNumberInputChange(event) {
        let newValue = event.target.value;
        newValue = newValue.replace(/[^0-9]/g, '');
        this.setState({startNumber: newValue});
    }

    handleEndNumberInputChange(event) {
        let newValue = event.target.value;
        newValue = newValue.replace(/[^0-9]/g, '');
        this.setState({endNumber: newValue});
    }

    async onHiddenRemove() {
        if (this.state.hiddenRemove === true) {
            await this.sendDeleteTraders();
            this.setState({hiddenRemove: false});
        } else {
            await this.getCheckTraders();
            this.setState({hiddenRemove: true});
        }
    }

    async getCheckTraders() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const RiskManagerContract = new ethers.Contract(
                this.addressRM,
                this.abiRM,
                provider
            );
            try {
                this.setState({arrHFTraderDelete: await RiskManagerContract.checkTraders.staticCall(ethers.parseUnits(this.state.startNumber, 0), ethers.parseUnits(this.state.endNumber, 0))});
                this.setState({arrDayTraderDelete: await RiskManagerContract.checkTradersDay(ethers.parseUnits(this.state.startNumber, 0), ethers.parseUnits(this.state.endNumber, 0))});
            } catch (err) {
                this.onToastUser(err.message, true);
            }
        } else {
            console.log("Connect MetaMask!");
        }
    }

    async sendDeleteTraders() {
        let startNum = parseInt(this.state.startNumber);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const RiskManagerContract = new ethers.Contract(
            this.addressRM,
            this.abiRM,
            signer
        );
        let countDeleteTrader = 0;
        for (let i = this.state.arrHFTraderDelete.length - 1; i >= 0; i--) {
            if (this.state.arrHFTraderDelete[i] <= ethers.parseUnits("1.05", 4) || this.state.arrDayTraderDelete[i] >= ethers.parseUnits("30", 0)) {
                try {
                    await RiskManagerContract.eliminate(ethers.parseUnits(String(startNum), 0));
                    countDeleteTrader++;
                } catch (err) {
                    this.onToastUser(err.message, true);
                }
            }
            startNum++;
        }
        this.setState({arrHFTraderDelete: []});
        this.setState({arrDayTraderDelete: []});
        this.onToastUser("Total traders deleted: " + String(countDeleteTrader), false);
    }

    async getTotalTraders() {
        if (this.state.userAccount !== ""){
            const provider = new ethers.BrowserProvider(window.ethereum);
            const RiskManagerContract = new ethers.Contract(
                this.addressRM,
                this.abiRM,
                provider
            );
            try {
                this.setState({totalTraders: (await RiskManagerContract.getCountTraders()).toString()});
                this.setState({endNumber: (await RiskManagerContract.getCountTraders()).toString()});
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
            await this.getTotalTraders();
        } else {
            console.log("Connect MetaMask!");
        }
    }

    render() {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '110vh' }}>
                <div style={{ position: 'relative' }}>
                {this.state.hiddenRemove === false ? (
                    <div className="rectangle" 
                    style={{
                        height: '420px',
                        width: '450px',
                        border: '2px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-center">
                                <p>Total traders: <strong>{this.state.totalTraders}</strong></p>
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-start" style={{ marginLeft: '45px' }}>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter start num."
                                    onChange={this.handleStartNumberInputChange}
                                    value={this.state.startNumber}
                                    style={{ width: '150px', marginBottom: '10px' }}
                                />
                            </Col>
                            <Col className="text-end" >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter end num."
                                    onChange={this.handleEndNumberInputChange}
                                    value={this.state.endNumber}
                                    style={{ width: '150px', marginBottom: '10px' }}
                                />
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-center">
                                <Button onClick={this.onHiddenRemove} variant="dark" style={{ width: '150px' }}>Check</Button>
                            </Col>
                        </Row>
                    </div>
                ) : (
                    <div className="rectangle" 
                    style={{
                        height: '420px',
                        width: '450px',
                        border: '2px solid #333',
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-center">
                                <Form.Control as="textarea" readOnly value={this.formatArrHFTraderDelete(this.state.arrHFTraderDelete, this.state.arrDayTraderDelete)} style={{ width: '100%', height: '92px', maxHeight: '370px' }} />
                            </Col>
                        </Row>
                        <Row className="button-row" style={{ marginBottom: '5px' }}>
                            <Col className="text-center">
                                <Button onClick={this.onHiddenRemove} variant="dark" style={{ width: '150px' }}>Remove</Button>
                            </Col>
                        </Row>
                    </div>
                )}
                </div>
            </Container>
        )
    }
}

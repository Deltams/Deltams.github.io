// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ITraderAccount {
    function eliminate(address _traderKill) external;

    function getHF(address _trader) external returns (uint256 _HF);

    function getDayDebt(address _trader) external view returns (uint256 _days);
}

contract RiskManager is Ownable {
    address[] traders;
    mapping(address => uint256) mapping_traders;
    ITraderAccount public ITRA;
    uint16 public HF_ELIMINATE = 10540; 

    constructor(address _TRA) Ownable(msg.sender) {
        ITRA = ITraderAccount(_TRA);
    }

    function addTrader(address _trader) external onlyTRA() {
        traders.push(_trader);
        mapping_traders[_trader] = traders.length - 1;
    }

    function getCountTraders() external view returns (uint256) {
        return traders.length;
    }

    function checkTraders(uint256 _begin, uint256 _end) external returns (uint256[] memory answer) {
        require(_begin < _end, "Going beyond the boundaries of the array");
        require(traders.length >= _end, "Going beyond the boundaries of the array");
        answer = new uint256[](_end - _begin);
        for (uint256 i = _begin; i < _end; i++) { 
            answer[i] = ITRA.getHF(traders[i]);
        }
        return answer;
    }

    function checkTradersDay(uint256 _begin, uint256 _end) external view returns (uint256[] memory answer) {
        require(_begin < _end, "Going beyond the boundaries of the array");
        require(traders.length >= _end, "Going beyond the boundaries of the array");
        answer = new uint256[](_end - _begin);
        for (uint256 i = _begin; i < _end; i++) { 
            answer[i] = ITRA.getDayDebt(traders[i]);
        }
        return answer;
    }

    function eliminate(uint256 _traderId) external returns (uint8) {
        require(_traderId < traders.length, "Going beyond the boundaries of the array");
        uint256 HF = ITRA.getHF(traders[_traderId]);
        uint256 DAYS_CREDIT = ITRA.getDayDebt(traders[_traderId]);
        require(HF <= HF_ELIMINATE || DAYS_CREDIT >= 30, "The trader has enough money or the deadline of 30 days has not passed. You cannot liquidate his account");
        ITRA.eliminate(traders[_traderId]);
        traders[_traderId] = traders[traders.length-1];
        traders.pop();
        return 1;
    }

    function deleteTrader(address _trader) external onlyTRA() { 
        uint256 _traderId = mapping_traders[_trader];
        address _new_position_trader = traders[traders.length-1];
        traders[_traderId] = _new_position_trader;
        mapping_traders[_new_position_trader] = _traderId;
        traders.pop();
    }

    function setHFEliminate(uint16 _new_HF_ELIMINATE) external onlyOwner {
        HF_ELIMINATE = _new_HF_ELIMINATE;
    }

    // if caller of function is contract TRA
    modifier onlyTRA() {
        require(
            msg.sender == address(ITRA),
            "Function accessible only by the trading account !!"
        );
        _;
    }
}

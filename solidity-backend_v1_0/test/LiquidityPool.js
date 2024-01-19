const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const bigInt = require("big-integer");
const { ethers } = require("hardhat");

describe("Проверка LiquidityPool", function () {
  async function deployLiqudityPool() {
    const [owner, otherAccount] = await ethers.getSigners();

    const TUSDC = await ethers.getContractFactory("TUSDC");
    const tUSDC = await TUSDC.deploy();

    const TWETH = await ethers.getContractFactory("TWETH");
    const tWETH = await TWETH.deploy();

    const CA = await ethers.getContractFactory("CentralAccount");
    const cA = await CA.deploy(
      await tUSDC.getAddress(),
      await tWETH.getAddress()
    );

    const amount = ethers.parseUnits("100", 6);
    const LP = await ethers.getContractFactory("LiquidityPool");
    const lP = await LP.deploy(
      await tUSDC.getAddress(),
      await cA.getAddress(),
      amount
    );
    await cA.connect(owner).setLP(await lP.getAddress());

    const TRA = await ethers.getContractFactory("TraderAccount");
    const tRA = await TRA.deploy(
      await tUSDC.getAddress(),
      await tWETH.getAddress(),
      await cA.getAddress()
    );
    await cA.connect(owner).setTRA(await tRA.getAddress());

    const RM = await ethers.getContractFactory("RiskManager");
    const rM = await RM.deploy(await tRA.getAddress());
    await tRA.connect(owner).setRiskManager(await rM.getAddress());

    const SC = await ethers.getContractFactory("SwapContract");
    const sC = await SC.deploy(
      await cA.getAddress(),
      await tRA.getAddress(),
      await tUSDC.getAddress(),
      await tWETH.getAddress()
    );
    await tRA.connect(owner).setSwapContract(await sC.getAddress());
    await cA.connect(owner).setSC(await sC.getAddress());

    const amountOtherUSDC = ethers.parseUnits("5000", 6);
    await tUSDC.transfer(otherAccount.address, amountOtherUSDC); // Переводим другому аккаунту 5000 USDC для дальнейших тестов

    const amountOtherWETH = ethers.parseUnits("5000", 18);
    await tWETH.transfer(otherAccount.address, amountOtherWETH); // Переводим другому аккаунту 5000 WETH для дальнейших тестов

    const amountOtherWETHSwapContract = ethers.parseUnits("1000", 18);
    await tWETH
      .connect(otherAccount)
      .transfer(await sC.getAddress(), amountOtherWETHSwapContract); // Перевод нужен для симуляции пула ликвидности

    const amountOtherUSDCSwapContract = ethers.parseUnits("1000", 6);
    await tUSDC
      .connect(otherAccount)
      .transfer(await sC.getAddress(), amountOtherUSDCSwapContract); // Перевод нужен для симуляции пула ликвидности

    return { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC };
  }

  describe("Загрузка контракта", function () {
    it("Проверим текущий баланс USDC", async function () {
      const amount = ethers.parseUnits("100", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      console.log(await lP.balanceX());
      expect(await lP.balanceX()).to.equal(amount);
    });
    it("Проверим текущий баланс Долей", async function () {
      const amount = ethers.parseUnits("100", 18);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      expect(await lP.balanceY()).to.equal(amount);
    });
    it("Проверим адреса Центрального аккаунта", async function () {
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      expect(await cA.getAddress()).to.equal(await lP.ICA());
    });
  });

  describe("Проверка ввода денежных средств (transferToLP)", function () {
    it("Вклад на CA от LP (инвестора) - у отправителя после перевода забрали USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountCheck = ethers.parseUnits("4000", 6);
      expect(await tUSDC.balanceOf(owner.address)).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта LP до перевода не было на счету USDC", async function () {
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      const amountCheck = ethers.parseUnits("0", 6);
      expect(await tUSDC.balanceOf(lP.getAddress())).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта LP после перевода не появились на счету USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountCheck = ethers.parseUnits("0", 6);
      expect(await tUSDC.balanceOf(lP.getAddress())).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта CA до перевода нет USDC", async function () {
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      const amountCheck = ethers.parseUnits("0", 6);
      expect(await tUSDC.balanceOf(cA.getAddress())).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта CA после перевода появились USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountCheck = ethers.parseUnits("1000", 6);
      expect(await tUSDC.balanceOf(cA.getAddress())).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта LP до перевода находилось запись о 0 USDC от отправителя", async function () {
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      const amountCheck = ethers.parseUnits("0", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора) - у контракта LP после перевода появилась запись о количестве USDC отправителя", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountCheck = ethers.parseUnits("1000", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора), пришел второй инвестор и перевел USDC на CA - у первого инвестора количество USDC осталось прежним", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountCheck = ethers.parseUnits("1000", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(amountCheck);
    });
    it("Вклад на CA от LP (инвестора), пришел второй инвестор и перевел USDC на CA - у второго инвестора количество USDC равно переведенным", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountCheck = ethers.parseUnits("500", 6);
      expect(await lP.connect(otherAccount).getUserBalance()).to.equal(
        amountCheck
      );
    });
    it("Вклад на CA от LP (инвестора), пришел второй инвестор и перевел USDC на CA - у контракта CA количество USDC равно суммарной массе от первого и второго инвестора", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountCheck = ethers.parseUnits("1500", 6);
      expect(await tUSDC.balanceOf(cA.getAddress())).to.equal(amountCheck);
    });
  });

  // Можно рассмотреть негативный сценарий вызова функции, когда у инвестора нет денег на аккаунте
  describe("Вывод денег инвестора (withdraw)", function () {
    it("Первый инвестор решил вывести часть своих USDC - у второго инвестора кол-во USDC для вывода не изменилось", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountOwnerWithdraw = ethers.parseUnits("300", 6);
      await lP.connect(owner).withdraw(amountOwnerWithdraw);
      const checkAmount = ethers.parseUnits("500", 6);
      expect(await lP.connect(otherAccount).getUserBalance()).to.equal(
        checkAmount
      );
    });
    it("Первый инвестор решил вывести часть своих USDC - у первого инвестора кол-во USDC для вывода уменьшилось", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountOwnerWithdraw = ethers.parseUnits("300", 6);
      await lP.connect(owner).withdraw(amountOwnerWithdraw);
      const checkAmount = ethers.parseUnits("700", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(checkAmount);
    });
    it("Первый инвестор решил вывести часть своих USDC - у первого инвестора пришло нужное кол-во USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountOwnerWithdraw = ethers.parseUnits("321", 6);
      await lP.connect(owner).withdraw(amountOwnerWithdraw);
      const checkAmount = ethers.parseUnits("4321", 6);
      expect(await tUSDC.balanceOf(owner.address)).to.equal(checkAmount);
    });
    it("Первый инвестор решил вывести часть своих USDC - на контракте CA стало меньше денег на часть вывода", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountOwnerWithdraw = ethers.parseUnits("300", 6);
      await lP.connect(owner).withdraw(amountOwnerWithdraw);
      const checkAmount = ethers.parseUnits("1200", 6);
      expect(await tUSDC.balanceOf(cA.getAddress())).to.equal(checkAmount);
    });
    it("Первый инвестор решил вывести все своих USDC - его баланс должен быть равен 0 USDC", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount } = await loadFixture(
        deployLiqudityPool
      );
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      const amountOwnerWithdraw = ethers.parseUnits("1000", 6);
      await lP.connect(owner).withdraw(amountOwnerWithdraw);
      const checkAmount = ethers.parseUnits("0", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(checkAmount);
    });
  });

  describe("Проверка начисления прибыли (accrueProfit)", function () {
    it("Начислили прибыль 500 - разделение прибыли для первого инвестора", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      // Симулируем поступление денег от трейдера на CA
      const amountTrader = ethers.parseUnits("600", 6);
      await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
      await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
      const amountTraderDebt = ethers.parseUnits("1000", 6);
      await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
      await tRA.connect(otherAccount).transferDebtToCA();
      const checkAmount = ethers.parseUnits("1011.25", 6);
      expect(await lP.connect(owner).getUserBalance()).to.equal(checkAmount);
    });
    it("Начислили прибыль 500 - разделение прибыли для второго инвестора", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      // Симулируем поступление денег от трейдера на CA
      const amountTrader = ethers.parseUnits("600", 6);
      await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
      await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
      const amountTraderDebt = ethers.parseUnits("1000", 6);
      await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
      await tRA.connect(otherAccount).transferDebtToCA();
      const checkAmount = ethers.parseUnits("505.625", 6);
      expect(await lP.connect(otherAccount).getUserBalance()).to.equal(
        checkAmount
      );
    });
    it("Начислили прибыль 500, первый инвестор забрал всю свою долю - кол-во денег для вывода второго инвестора не изменилось", async function () {
      const amount = ethers.parseUnits("1000", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      const amountOther = ethers.parseUnits("500", 6);
      await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
      await lP.connect(otherAccount).transferToLP(amountOther);
      // Симулируем поступление денег от трейдера на CA
      const amountTrader = ethers.parseUnits("600", 6);
      await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
      await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
      const amountTraderDebt = ethers.parseUnits("1000", 6);
      await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
      await tRA.connect(otherAccount).transferDebtToCA();
      const withdrawAmount = ethers.parseUnits("1011.25", 6);
      await lP.connect(owner).withdraw(withdrawAmount);
      const checkAmount = ethers.parseUnits("505.625", 6);
      expect(await lP.connect(otherAccount).getUserBalance()).to.equal(
        checkAmount
      );
    });
  });

  // describe("Проверка начисления убытка (accrueLoss)", function () {
  //     it("Пришел убыток 200 - разделение убытка для первого инвестора", async function () {
  //         const amount = ethers.parseUnits("1000", 6);
  //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
  //         await tUSDC.approve(lP.getAddress(), amount);
  //         await lP.connect(owner).transferToLP(amount);
  //         const amountOther = ethers.parseUnits("500", 6);
  //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
  //         await lP.connect(otherAccount).transferToLP(amountOther);
  //         // Симулируем убыток денег от трейдера на CA, но не переводим с CA USDC
  //         const amountTrader = ethers.parseUnits("600", 6);
  //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
  //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
  //         const amountTraderDebt = ethers.parseUnits("1000", 6);
  //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
  //         const amountTraderSwapUSDC = ethers.parseUnits("1600", 6);
  //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
  //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("5", 6));
  //         await rM.eliminate(ethers.parseUnits("0"));
  //         const checkAmount = ethers.parseUnits("875", 6);
  //         expect(await lP.connect(owner).getUserBalance()).to.equal(checkAmount);
  //     });
  //     it("Начислили убыток 200 - разделение убытка для второго инвестора", async function () {
  //         const amount = ethers.parseUnits("1000", 6);
  //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
  //         await tUSDC.approve(lP.getAddress(), amount);
  //         await lP.connect(owner).transferToLP(amount);
  //         const amountOther = ethers.parseUnits("500", 6);
  //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amountOther);
  //         await lP.connect(otherAccount).transferToLP(amountOther);
  //         // Симулируем убыток денег от трейдера на CA, но не переводим с CA USDC
  //         const amountTrader = ethers.parseUnits("600", 6);
  //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
  //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
  //         const amountTraderDebt = ethers.parseUnits("1000", 6);
  //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
  //         const amountTraderSwapUSDC = ethers.parseUnits("1600", 6);
  //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
  //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("5", 6));
  //         await rM.eliminate(ethers.parseUnits("0"));
  //         const checkAmount = ethers.parseUnits("437.5", 6);
  //         expect(await lP.connect(otherAccount).getUserBalance()).to.equal(checkAmount);
  //     });
  // });

  describe("Негативное тестирование", function () {
    it("Попытка перевода на CentralAccount 0 USDC", async function () {
      const amount = ethers.parseUnits("0", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await tUSDC.approve(lP.getAddress(), amount);
      await lP.connect(owner).transferToLP(amount);
      expect(await lP.connect(owner).getUserBalance()).to.equal(amount);
    });
    it("Попытка запросить баланс от неизвестного инвестора", async function () {
      const amount = ethers.parseUnits("0", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      expect(await lP.connect(otherAccount).getUserBalance()).to.equal(amount);
    });
    it("Попытка вывода средств от неизвестного инвестора", async function () {
      const amount = ethers.parseUnits("10", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await expect(
        lP.connect(otherAccount).withdraw(amount)
      ).to.be.revertedWith(
        "There are not enough funds to withdraw! Are you trying to withdraw more USDC than you have."
      );
    });
    it("Попытка вывода средств от неизвестного инвестора в размере 0 USDC", async function () {
      const amount = ethers.parseUnits("0", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await lP.connect(otherAccount).withdraw(amount);
      expect(1).to.equal(1);
    });
    it("Попытка вызова внутренней функции (safeTransferFrom)", async function () {
      const amount = ethers.parseUnits("10", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      try {
        await lP
          .connect(otherAccount)
          .safeTransferFrom(
            tUSDC.getAddress(),
            owner.address,
            otherAccount.address,
            amount
          );
        expect(1).to.equal(2);
      } catch (err) {
        expect(String(err)).to.equal(
          "TypeError: lP.connect(...).safeTransferFrom is not a function"
        );
      }
    });
    it("Попытка вызова внутренней функции (transfer)", async function () {
      const amount = ethers.parseUnits("10", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      try {
        await lP
          .connect(otherAccount)
          .transfer(owner.address, otherAccount.address, amount);
        expect(1).to.equal(2);
      } catch (err) {
        expect(String(err)).to.equal(
          "TypeError: lP.connect(...).transfer is not a function"
        );
      }
    });
    it("Попытка начисления убытка с помощью функции (accrueLoss) доступной только центральному аккаунту", async function () {
      const amount = ethers.parseUnits("10", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await expect(lP.connect(owner).accrueLoss(amount)).to.be.revertedWith(
        "Only the central account can indicate a loss!"
      );
    });
    it("Попытка начисления прибыли с помощью функции (accrueProfit) доступной только центральному аккаунту", async function () {
      const amount = ethers.parseUnits("10", 6);
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      await expect(lP.connect(owner).accrueProfit(amount)).to.be.revertedWith(
        "Only the central account can indicate income!"
      );
    });
    it("check requirements to be reverted", async function () {
      const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } =
        await loadFixture(deployLiqudityPool);
      const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
      await expect(
        LiquidityPool.deploy(await tUSDC.getAddress(), await otherAccount, 0)
      ).to.be.reverted;

      const amount = ethers.parseUnits("10000", 6);
      const liquidity_pool = await LiquidityPool.deploy(
        await tUSDC.getAddress(),
        await otherAccount,
        1000
      );
      await liquidity_pool.connect(otherAccount).accrueLoss(amount);
      assert.equal(
        ethers.formatUnits(await liquidity_pool.balanceX()),
        "0.0",
        "Value of balanceX should be 0.0"
      );

      await expect(liquidity_pool.transferToLP(1000)).to.be.reverted;
    });
  });
});

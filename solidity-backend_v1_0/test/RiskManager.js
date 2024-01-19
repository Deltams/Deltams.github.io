const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect, assert } = require("chai");
const bigInt = require("big-integer");
const {ethers} = require("hardhat")

describe("Проверка RiskManager", function () {

    let tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC, otherAccount2;

    before(async function() {
        [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const TUSDC = await ethers.getContractFactory("TUSDC");
        tUSDC = await TUSDC.deploy();

        const TWETH = await ethers.getContractFactory("TWETH");
        tWETH = await TWETH.deploy();
        
        const CA = await ethers.getContractFactory("CentralAccount");
        cA = await CA.deploy(await tUSDC.getAddress(), await tWETH.getAddress());

        const amount = ethers.parseUnits("100", 6);
        const LP = await ethers.getContractFactory("LiquidityPool");
        lP = await LP.deploy(await tUSDC.getAddress(), await cA.getAddress(), amount);
        await cA.connect(owner).setLP(await lP.getAddress());

        const TRA = await ethers.getContractFactory("TraderAccount");
        tRA = await TRA.deploy(await tUSDC.getAddress(), await tWETH.getAddress(), await cA.getAddress());
        await cA.connect(owner).setTRA(await tRA.getAddress());

        const RM = await ethers.getContractFactory("RiskManager");
        rM = await RM.deploy(await tRA.getAddress());
        await tRA.connect(owner).setRiskManager(await rM.getAddress());

        const SC = await ethers.getContractFactory("SwapContractTest");
        sC = await SC.deploy(await cA.getAddress(), await tRA.getAddress(), await tUSDC.getAddress(), await tWETH.getAddress());
        await tRA.connect(owner).setSwapContract(await sC.getAddress());
        await cA.connect(owner).setSC(await sC.getAddress());

        const amountOtherUSDC = ethers.parseUnits("5000", 6);
        await tUSDC.transfer(otherAccount, amountOtherUSDC); // Переводим другому аккаунту 5000 USDC для дальнейших тестов
        await tUSDC.transfer(otherAccount2, ethers.parseUnits("20", 6)); // Переводим другому аккаунту 5000 USDC для дальнейших тестов

        const amountOtherWETH = ethers.parseUnits("5000", 18);
        await tWETH.transfer(otherAccount, amountOtherWETH); // Переводим другому аккаунту 5000 WETH для дальнейших тестов
        await tWETH.transfer(otherAccount2, ethers.parseUnits("20", 18)); // Переводим другому аккаунту 5000 WETH для дальнейших тестов

        const amountOtherWETHSwapContract = ethers.parseUnits("1000", 18);
        await tWETH.connect(otherAccount).transfer(await sC.getAddress(), amountOtherWETHSwapContract); // Перевод нужен для симуляции пула ликвидности

        const amountOtherUSDCSwapContract = ethers.parseUnits("1000", 6);
        await tUSDC.connect(otherAccount).transfer(await sC.getAddress(), amountOtherUSDCSwapContract); // Перевод нужен для симуляции пула ликвидности

    });

    describe("Проверка трейдера на ликвидацию (checkTraders и eliminate)", function () {
        it("Проверка трейдера на ликвидацию (checkTraders)", async function () {
            // const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC, otherAccount2 } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов и трейдеров
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            const amountTrader = ethers.parseUnits("100", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("200", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            const amountTraderSwapUSDC = ethers.parseUnits("200", 6);
            // Часть симуляции инвесторов и трейдеров
            let tr = await rM.checkTraders(ethers.parseUnits("0", 0), ethers.parseUnits("1", 0));
            expect(tr[0]).to.equal(ethers.parseUnits("1.5", 4));

            const amountTraderSwapWETH = ethers.parseEther("0.0000000000000001");
            expect(tRA.connect(otherAccount).swapWETHToUSDC(amountTraderSwapWETH,ethers.parseUnits("0", 0))).to.be.reverted;

            await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC,ethers.parseUnits("0", 0));

            await tRA.connect(otherAccount).swapWETHToUSDC(amountTraderSwapWETH,ethers.parseUnits("0", 0));

            // Часть симуляции инвесторов и трейдеров
            tr = await rM.checkTraders(ethers.parseUnits("0", 0), ethers.parseUnits("1", 0));
            assert.isBelow(tr[0],ethers.parseUnits("1.5", 4));

        });

        it("Проверка трейдера на день (checkTradersDay)", async function () {
            // const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC, otherAccount2 } = await loadFixture(deployLiqudityPool);

            // Часть симуляции инвесторов и трейдеров
            let tr = await rM.checkTradersDay(ethers.parseUnits("0", 0), ethers.parseUnits("1", 0));
            expect(tr[0]).to.equal(ethers.parseUnits("0", 0));

            expect(rM.checkTradersDay(ethers.parseUnits("10", 0), ethers.parseUnits("1", 0))).to.be.reverted;
            expect(rM.checkTradersDay(ethers.parseUnits("0", 0), ethers.parseUnits("10", 0))).to.be.reverted;

            let countTraders = await rM.getCountTraders();
            expect(countTraders).to.be.equal(ethers.parseUnits("1", 0));

        });

        it("Отказ и успешная ликвидация по значению HF (eliminate)", async function () {
            //const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC, otherAccount2 } = await loadFixture(deployLiqudityPool);

            // Часть симуляции инвесторов и трейдеров
            let tr = await rM.checkTraders(ethers.parseUnits("0", 0), ethers.parseUnits("1", 0));
            assert.isAbove(tr[0],ethers.parseUnits("1.4", 4));

            await expect( rM.eliminate(ethers.parseUnits("0", 0))).to.be.revertedWith("The trader has enough money or the deadline of 30 days has not passed. You cannot liquidate his account");

            await rM.connect(owner).setHFEliminate(ethers.parseUnits("1.5", 4));

            rM.on("eliminated", (result_of_elimination) => {
                console.log(result_of_elimination);
            });

            await expect( rM.eliminate(ethers.parseUnits("0", 0))).to.be.reverted;

        });

        it("check requirements and modificators to be reverted",async function (){
            //const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);

            // requirements to be reverted
            expect( rM.checkTraders(ethers.parseUnits("10", 0), ethers.parseUnits("1", 0))).to.be.reverted;
            expect( rM.checkTraders(ethers.parseUnits("0", 0), ethers.parseUnits("10", 0))).to.be.reverted;
            expect( rM.eliminate(ethers.parseUnits("10", 0))).to.be.reverted;

            // modificators to be reverted
            expect( rM.connect(otherAccount).addTrader(owner)).to.be.reverted;
            expect( rM.connect(otherAccount).deleteTrader(owner)).to.be.reverted;
            expect( rM.connect(otherAccount).setHFEliminate(0)).to.be.reverted;

        });
    });

    describe("Вспомогательная проверка TRA: Негативное тестирование", function(){
        it("Попытка вернуть долг USDC при недостатке средств", async function () {

            // Часть симуляции инвесторов и трейдеров
            const amount = ethers.parseUnits("100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);

            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("20", 6);
            await tUSDC.connect(otherAccount2).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount2).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("100", 6);

            await tRA.connect(otherAccount2).transferDebtFromCA(amountTraderDebt);
            
            await tRA.connect(otherAccount2).swapUSDCToWETH(amountTraderDebt,ethers.parseUnits("0", 0));

            expect(tRA.connect(otherAccount2).transferDebtToCA()).to.be.reverted;
        });
    });

});
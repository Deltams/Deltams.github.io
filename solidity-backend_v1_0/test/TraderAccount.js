const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const bigInt = require("big-integer");
const {ethers} = require("hardhat")

describe("Проверка TraderAccount", function () {

    async function deployLiqudityPool() {
        const [owner, otherAccount] = await ethers.getSigners();

        const TUSDC = await ethers.getContractFactory("TUSDC");
        const tUSDC = await TUSDC.deploy();

        const TWETH = await ethers.getContractFactory("TWETH");
        const tWETH = await TWETH.deploy();
        
        const CA = await ethers.getContractFactory("CentralAccount");
        const cA = await CA.deploy(await tUSDC.getAddress(), await tWETH.getAddress());

        const amount = ethers.parseUnits("100", 6);
        const LP = await ethers.getContractFactory("LiquidityPool");
        const lP = await LP.deploy(await tUSDC.getAddress(), await cA.getAddress(), amount);
        await cA.connect(owner).setLP(await lP.getAddress());

        const TRA = await ethers.getContractFactory("TraderAccount");
        const tRA = await TRA.deploy(await tUSDC.getAddress(), await tWETH.getAddress(), await cA.getAddress());
        await cA.connect(owner).setTRA(await tRA.getAddress());

        const RM = await ethers.getContractFactory("RiskManager");
        const rM = await RM.deploy(await tRA.getAddress());
        await tRA.connect(owner).setRiskManager(await rM.getAddress());

        const SC = await ethers.getContractFactory("SwapContract");
        const sC = await SC.deploy(await cA.getAddress(), await tRA.getAddress(), await tUSDC.getAddress(), await tWETH.getAddress());
        await tRA.connect(owner).setSwapContract(await sC.getAddress());
        await cA.connect(owner).setSC(await sC.getAddress());

        const amountOtherUSDC = ethers.parseUnits("5000", 6);
        await tUSDC.transfer(otherAccount.address, amountOtherUSDC); // Переводим другому аккаунту 5000 USDC для дальнейших тестов

        const amountOtherWETH = ethers.parseUnits("5000", 18);
        await tWETH.transfer(otherAccount.address, amountOtherWETH); // Переводим другому аккаунту 5000 WETH для дальнейших тестов

        const amountOtherWETHSwapContract = ethers.parseUnits("1000", 18);
        await tWETH.connect(otherAccount).transfer(await sC.getAddress(), amountOtherWETHSwapContract); // Перевод нужен для симуляции пула ликвидности

        const amountOtherUSDCSwapContract = ethers.parseUnits("1000", 6);
        await tUSDC.connect(otherAccount).transfer(await sC.getAddress(), amountOtherUSDCSwapContract); // Перевод нужен для симуляции пула ликвидности

        return { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC };
    }

    describe("Проверка основной логики трейдера", function () {
        it("Трейдер перевел USDC на свой аккаунт - появилась запись о количестве USDC на аккаунте TRA", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            expect(await tRA.connect(otherAccount).getUserBalanceUSDC()).to.equal(amountTrader);
        });
        it("Трейдер перевел USDC на свой аккаунт - USDC пришли в нужном размере на контракт CA", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            expect(await tUSDC.balanceOf(await cA.getAddress())).to.equal(amountTrader);
        });
        it("Трейдер на 100$ берет 10-x плечи - USDC пришли на аккаунт трейдеру", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("100", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);

            await tRA.connect(otherAccount).transferDebtFromCA(ethers.parseUnits("1000", 6));
            expect(await tRA.connect(otherAccount).getUserBalanceUSDC()).to.equal(ethers.parseUnits("1100", 6));
        });
        it("Трейдер на 100$ берет 10-x плечи - необходимое количество USDC заблокировали в контракте CA", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("100", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("1000", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            expect(await cA.connect(otherAccount).countUSDCTraders()).to.equal(amountTraderDebt);
        });
        it("Трейдер на 100$ берет 10-x плечи - количество USDC на аккаунте CA не изменилось", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("100", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("1000", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            expect(await tUSDC.balanceOf(await cA.getAddress())).to.equal(ethers.parseUnits("6300", 6));
        });
        it("Трейдер на 100$ не взял плечо, вывел средства", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            await expect(tRA.connect(otherAccount).withdrawUSDC(amountTrader))
                .to.not.be.reverted;
        });
        it("getUserBalanceWEther", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            expect(await tRA.connect(otherAccount).getUserBalanceWEther()).to.equal(ethers.parseUnits("0",0));
        });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH - запись о количестве WETH появилась у Трейдера", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         expect(await tRA.connect(otherAccount).getUserBalanceWEther()).to.equal(ethers.parseUnits("0.0000000000016", 18));
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH - USDC на аккаунте CA уменьшились на 160$", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         expect(await tUSDC.balanceOf(await cA.getAddress())).to.equal(ethers.parseUnits("6140", 6));
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH - WETH на аккаунте CA увеличилось на равную запись в аккаунте Трейдера", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         expect(await tWETH.balanceOf(await cA.getAddress())).to.equal(await tRA.connect(otherAccount).getUserBalanceWEther());
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH, курс упал и он переводит все WETH в USDC - запись о количестве WETH у Трейдера = 0", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         expect(await tRA.connect(otherAccount).getUserBalanceWEther()).to.equal(ethers.parseUnits("0", 18));
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH, курс упал и он переводит все WETH в USDC - запись о количестве WETH у CA = 0", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         expect(await tWETH.balanceOf(await cA.getAddress())).to.equal(ethers.parseUnits("0", 6));
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH, курс упал и он переводит все WETH в USDC - доступное количество USDC для Трейдера = 220$", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         expect(await tRA.connect(otherAccount).getUserBalanceUSDC()).to.equal(ethers.parseUnits("220", 6));
    //     });
    //     it("Трейдер взял плечи 2-x (Общ. сумма 300$) и перевел 160$ в WETH, курс упал и он переводит все WETH в USDC - общая сумма USDC на контракте CA уменьшилась на 80$", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         expect(await tUSDC.balanceOf(await cA.getAddress())).to.equal(ethers.parseUnits("6220", 6));
    //     });
    //     it("Трейдер возвращает долг - после возврата трейдеру доступно 16$", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         await tRA.connect(otherAccount).transferDebtToCA();
    //         expect(await tRA.connect(otherAccount).getUserBalanceUSDC()).to.equal(ethers.parseUnits("16", 6));
    //     });
    //     it("Трейдер возвращает долг - количество заблокированных денег CA = 0", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         await tRA.connect(otherAccount).transferDebtToCA();
    //         expect(await cA.countUSDCTraders()).to.equal(ethers.parseUnits("0", 6));
    //     });
    //     it("Трейдер возвращает долг - количество доступных USDC для вывода Владельцем = 0.4 USDC (CA)", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         await tRA.connect(otherAccount).transferDebtToCA();
    //         expect(await cA.countUSDCOwner()).to.equal(ethers.parseUnits("0.4", 6));
    //     });
    //     it("Трейдер выводит все свои USDC - доступные средства после вывода у Трейдера = 0", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         await tRA.connect(otherAccount).transferDebtToCA();
    //         await tRA.connect(otherAccount).withdrawUSDC(ethers.parseUnits("16", 6));
    //         expect(await tRA.connect(otherAccount).getUserBalanceUSDC()).to.equal(ethers.parseUnits("0", 6));
    //     });
    //     it("Трейдер выводит все свои USDC - после вывода, количество USDC у CA уменьшилось на 16$", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         await tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("0.0000000000016", 18));
    //         await tRA.connect(otherAccount).transferDebtToCA();
    //         let checkAmount = await tUSDC.balanceOf(await cA.getAddress());
    //         await tRA.connect(otherAccount).withdrawUSDC(ethers.parseUnits("16", 6));
    //         expect(checkAmount - await tUSDC.balanceOf(await cA.getAddress())).to.equal(ethers.parseUnits("16", 6));
    //     });
    });

    // describe("Проверка подсчета HF", function () {
    //     it("Трейдер внес 100$ и взял кредит 2-x (общ. сумма 300$) - значение HF должно быть = 1.5", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         expect(await tRA.getHF(otherAccount.address)).to.equal(ethers.parseUnits("1.5", 4));
    //     });
    //     it("Трейдер внес 100$ и взял кредит 2-x (общ. сумма 300$), перевел в WETH 160$ и курс упал - значение HF должно быть = 1.1", async function () {
    //         const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
    //         // Часть симуляции инвесторов
    //         const amount = ethers.parseUnits("3100", 6);
    //         await tUSDC.connect(owner).approve(lP.getAddress(), amount);
    //         await lP.connect(owner).transferToLP(amount);
    //         await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
    //         await lP.connect(otherAccount).transferToLP(amount);
    //         // Часть симуляции инвесторов
    //         const amountTrader = ethers.parseUnits("100", 6);
    //         await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
    //         await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
    //         const amountTraderDebt = ethers.parseUnits("200", 6);
    //         await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
    //         const amountTraderSwapUSDC = ethers.parseUnits("160", 6);
    //         await tRA.connect(otherAccount).swapUSDCToWETH(amountTraderSwapUSDC);
    //         expect(await tRA.getHF(otherAccount.address)).to.equal(ethers.parseUnits("1.1", 4));
    //     });
    // });

    describe("Проверка подсчета времени займа", function () {
        it("Получаем количество пройденных дней от начала займа", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("100", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("200", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            expect(await tRA.getDayDebt(otherAccount.address)).to.equal(ethers.parseUnits("0", 0));
        });
    });

    describe("Проверка возможностей владельца контракта", function () {
        it("Попытка смены контракта RM", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            await tRA.connect(owner).setRiskManager(otherAccount.address);
            expect(await tRA.IRM()).to.equal(otherAccount.address);
        });
        it("Попытка смены контракта SC", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            await tRA.connect(owner).setSwapContract(otherAccount.address);
            expect(await tRA.ISC()).to.equal(otherAccount.address);
        });
        it("Попытка смены процентной ставки кредита", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amount = ethers.parseUnits("0", 4);
            await tRA.connect(owner).setDebtInterest(amount);
            expect(await tRA.debtInterest()).to.equal(amount);
        });
    });

    describe("Негативное тестирование", function () {
        it("Попытка смены проверяющего аккаунта (RM) не Владельцем контракта", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            try {
                await tRA.connect(otherAccount).setRiskManager(rM.getAddress());
                expect(1).to.equal(2);
            } catch (err) {
                expect(1).to.equal(1);
            }
        });
        it("Попытка смены SwapContract не Владельцем контракта", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            expect(tRA.connect(otherAccount).setSwapContract(sC.getAddress())).to.be.reverted;
        });
        it("Попытка смены процентной ставки (комиссии) не Владельцем контракта", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amount = ethers.parseUnits("0", 4);
            try {
                await tRA.connect(otherAccount).setDebtInterest(amount);
                expect(1).to.equal(2);
            } catch (err) {
                expect(1).to.equal(1);
            }
        });
        it("Попытка смены процентной ставки (комиссии) более 100%", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amount = ethers.parseUnits("1.1", 4);
            await expect(tRA.connect(owner).setDebtInterest(amount))
                .to.be.revertedWith('You cannot accrue more than 100% of the profit!');
        });
        it("Попытка получения кредита имея на счету изначально 0 USDC", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            const amount = ethers.parseUnits("100", 6);
            await expect(tRA.connect(otherAccount).transferDebtFromCA(amount))
                .to.be.revertedWith('It is impossible to receive an amount more than 10 times more than the available funds in the account!');
        });
        it("Попытка повторного получения кредита без возврата предыдущего", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("1000", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            await expect(tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt))
                .to.be.revertedWith('Pay back the debt!');
        });
        it("Попытка получения USDC больше чем в 10 раз", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("6001", 6);
            await expect(tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt))
                .to.be.revertedWith('It is impossible to receive an amount more than 10 times more than the available funds in the account!');
        });
        // it("Попытка вернуть весь долг, но недостаточно средств на аккаунте", async function () {
        //     const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
        //     // Часть симуляции инвесторов
        //     const amount = ethers.parseUnits("3100", 6);
        //     await tUSDC.connect(owner).approve(lP.getAddress(), amount);
        //     await lP.connect(owner).transferToLP(amount);
        //     await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
        //     await lP.connect(otherAccount).transferToLP(amount);
        //     // Часть симуляции инвесторов
        //     const amountTrader = ethers.parseUnits("600", 6);
        //     await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
        //     await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
        //     const amountTraderDebt = ethers.parseUnits("1000", 6);
        //     await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
        //     // await tRA.connect(otherAccount).swapUSDCToWETH(ethers.parseUnits("900", 6));
        //     await expect(tRA.connect(otherAccount).transferDebtToCA())
        //         .to.be.revertedWith('There are not enough funds to repay the debt, top up your account or transfer the WETH to the USDC');
        // });
        it("Попытка вывести USDC без возврата долга", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("1000", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            await expect(tRA.connect(otherAccount).withdrawUSDC(amountTraderDebt))
                .to.be.revertedWith('Pay back the debt');
        });
        it("Попытка вывести больше USDC чем доступно для вывода", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            const amountTraderDebt = ethers.parseUnits("1000", 6);
            await tRA.connect(otherAccount).transferDebtFromCA(amountTraderDebt);
            await tRA.connect(otherAccount).transferDebtToCA();
            await expect(tRA.connect(otherAccount).withdrawUSDC(amountTrader))
                .to.be.revertedWith('Your USDC is less than amount');
        });
        it("Попытка уничтожить аккаунт трейдера не через контракт RM", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            await expect(tRA.connect(owner).eliminate(otherAccount))
                .to.be.revertedWith('Only the contract risk manager has the right to liquidate the account !!');
        });
        it("Попытка получить оценку риска не имея долга", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            await expect(tRA.connect(owner).getHF(otherAccount.address))
                .to.be.revertedWith('You have no debt, it is impossible to calculate the risk!');
        });
        it("Попытка получить количество дней долга не имея долга", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            await expect(tRA.connect(owner).getDayDebt(otherAccount.address))
                .to.be.revertedWith('You have no debts, it is impossible to calculate the time!');
        });
        it("Попытка перевода большего кол-ва USDC в WETH, чем есть на аккаунте", async function () {
            const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
            // Часть симуляции инвесторов
            const amount = ethers.parseUnits("3100", 6);
            await tUSDC.connect(owner).approve(lP.getAddress(), amount);
            await lP.connect(owner).transferToLP(amount);
            await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
            await lP.connect(otherAccount).transferToLP(amount);
            // Часть симуляции инвесторов
            const amountTrader = ethers.parseUnits("600", 6);
            await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
            await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
            await expect(tRA.connect(otherAccount).swapUSDCToWETH(ethers.parseUnits("700", 6),ethers.parseUnits("0", 0)))
                .to.be.revertedWith('Not enough USDC');
        });
        // it("Попытка перевода большего кол-ва WETH в USDC, чем есть на аккаунте", async function () {
        //     const { tUSDC, cA, lP, owner, otherAccount, tWETH, tRA, rM, sC } = await loadFixture(deployLiqudityPool);
        //     // Часть симуляции инвесторов
        //     const amount = ethers.parseUnits("3100", 6);
        //     await tUSDC.connect(owner).approve(lP.getAddress(), amount);
        //     await lP.connect(owner).transferToLP(amount);
        //     await tUSDC.connect(otherAccount).approve(lP.getAddress(), amount);
        //     await lP.connect(otherAccount).transferToLP(amount);
        //     // Часть симуляции инвесторов
        //     const amountTrader = ethers.parseUnits("600", 6);
        //     await tUSDC.connect(otherAccount).approve(tRA.getAddress(), amountTrader);
        //     await tRA.connect(otherAccount).transferToTraderUSDC(amountTrader);
        //     await tRA.connect(otherAccount).swapUSDCToWETH(amountTrader);
        //     await expect(tRA.connect(otherAccount).swapWETHToUSDC(ethers.parseUnits("50000000", 18)))
        //         .to.be.revertedWith('Not enough WETH');
        // });
    });
});
  
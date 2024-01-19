// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const {ethers} = require("hardhat")

async function main() {
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

  const SC = await ethers.getContractFactory("SwapContractTest");
  const sC = await SC.deploy(await cA.getAddress(), await tRA.getAddress(), await tUSDC.getAddress(), await tWETH.getAddress());
  await tRA.connect(owner).setSwapContract(await sC.getAddress());
  await cA.connect(owner).setSC(await sC.getAddress());

  const amountOtherUSDC = ethers.parseUnits("5000", 6);
  await tUSDC.connect(owner).transfer(otherAccount, amountOtherUSDC); // Переводим другому аккаунту 5000 USDC для дальнейших тестов

  const amountOtherWETH = ethers.parseUnits("5000", 18);
  await tWETH.transfer(otherAccount, amountOtherWETH); // Переводим другому аккаунту 5000 WETH для дальнейших тестов



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

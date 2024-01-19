// test/swap.test.js

const { ethers } = require('hardhat');
const { assert, expect } = require('chai');
// const routerArtifact = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
// const quoterArtifact = require('../artifacts/@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol/IQuoter.json');
const erc20Artifact = require("../artifacts/contracts/TUSDC.sol/TUSDC.json");
const wethArtifact = require("../artifacts/contracts/TWETH.sol/TWETH.json");
const centralArtifact = require("../artifacts/contracts/CentralAccount.sol/CentralAccount.json");
const swapArtifact = require("../artifacts/contracts/SwapContract.sol/SwapContract.json");
const hre = require("hardhat");
const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);

const CONTRACT_ADDRESSES = {
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ROUTER: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
  QUOTER: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  PAIR: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
};

function getContractInstance(address, artifact, signer) {
  return new hre.ethers.Contract(address, artifact.abi, signer);
}

describe('Test Central Account', () => {

  let uniswap;
  let address;
  let other_contract;
  let swap_contract;
  const ONE_USDC = 1_000_000;
  let tWETH;
  let tUSDC;
  let central_account;
  let SC;
  let liquidity_pool;

  before(async function() {
    [owner, other_contract, address,uniswap,LP,TRA,SC] = await ethers.getSigners();

    tUSDC = getContractInstance(CONTRACT_ADDRESSES.USDC,erc20Artifact,uniswap);

    tWETH = getContractInstance(CONTRACT_ADDRESSES.WETH,wethArtifact,uniswap);

    const CentralAccount = await ethers.getContractFactory("CentralAccount");
    central_account = await CentralAccount.deploy(await tUSDC.getAddress(), await tWETH.getAddress());

    await central_account.connect(owner).setLP(LP);
    await central_account.connect(owner).setTRA(TRA);

    const SwapContract = await ethers.getContractFactory("SwapContract");
    swap_contract = await SwapContract.deploy(await central_account.getAddress(), TRA, await tUSDC.getAddress(), await tWETH.getAddress());
    await central_account.connect(owner).setSC(await swap_contract.getAddress());

    const txW = await tWETH.deposit({ value: ethers.parseEther('5000') });
    await txW.wait();

    await tWETH.connect(uniswap).transfer(await central_account.getAddress(), ethers.parseEther('5'));

    assert.equal(hre.ethers.formatEther(await tWETH.balanceOf(await central_account.getAddress())), '5.0', 'Initial WETH balance should be 5.0');
    assert.equal(hre.ethers.formatUnits(await tUSDC.balanceOf(await central_account.getAddress()),6), '0.0', 'Initial USDC balance should be 0');

  });

  it("should be deployed", async function (){
    chai.expect(await central_account.getAddress()).to.be.properAddress;
  });

  it("check if-else", async function(){

    await expect(central_account.connect(TRA).returnTraderDebt(0,0,false))
      .to.not.be.reverted; 

    // Подготовка  

    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidity_pool = await LiquidityPool.deploy(await tUSDC.getAddress(), await central_account.getAddress(),1000); 
    await central_account.connect(owner).setLP(await liquidity_pool.getAddress()); 

    // Подготовка  

    await expect(central_account.connect(TRA).returnTraderDebt(0,1,false))
      .to.not.be.reverted;
      
    await central_account.connect(TRA).returnTraderDebt(1,1,true);
    console.log(await central_account.countUSDCTraders());
    console.log(ethers.formatUnits(await central_account.countUSDCTraders()));

    assert.equal(ethers.formatUnits(await central_account.countUSDCTraders()), '0.0', 'Value of countUSDCTraders should be 0.0');  


    await central_account.connect(owner).setLP(LP); 

  });

  it("check modificators to be not reverted", async function() {

    await expect(central_account.connect(owner).setOwnerProfit(0))
      .to.not.be.reverted;

  });

  it("check modificators to be reverted", async function() {

    await expect(central_account.connect(address).setLP(address))
      .to.be.reverted;

    await expect(central_account.connect(address).setTRA(address))
      .to.be.reverted;

    await expect(central_account.connect(address).setSC(address))
      .to.be.reverted;

    await expect(central_account.connect(address).approve(tWETH,address, 0))
      .to.be.reverted;

    await expect(central_account.connect(address).getTraderDebt(0))
      .to.be.reverted;

    await expect(central_account.connect(address).getTraderDebt(0))
      .to.be.reverted;

    await expect(central_account.connect(address).returnTraderDebt(0,0,false))
      .to.be.reverted;

    await expect(central_account.connect(address).withdraw(0))
      .to.be.reverted;

    await expect(central_account.connect(address).setOwnerProfit(0))
      .to.be.reverted;

  });

  it("check requirements to be not reverted", async function() {

    await expect(central_account.connect(LP).approve(tWETH,address, 0))
    .to.not.be.reverted;

    await expect(central_account.connect(TRA).approve(tWETH,address, 0))
      .to.not.be.reverted;

    await central_account.connect(owner).setSC(SC);
    await expect(central_account.connect(SC).approve(tWETH,address, 0))
      .to.not.be.reverted;
    await central_account.connect(owner).setSC(await swap_contract.getAddress());

    await expect(central_account.connect(owner).setOwnerProfit(0))
      .to.not.be.reverted;

    await expect(central_account.connect(owner).withdraw(0))
      .to.not.be.reverted;   

  });

  it("check requirements to be reverted", async function() {

    await expect(central_account.connect(owner).approve(tWETH,address, 0))
      .to.be.revertedWith('Function accessible only by the liquidity pool, swap contract and Trading account !!');

    await expect(central_account.connect(owner).withdraw(1))
      .to.be.reverted;

    await expect(central_account.connect(owner).setOwnerProfit(10001))
      .to.be.reverted;

    // // Подготовка к остальным тестам

    // let swap_res = await swap_contract.connect(TRA).swapWETHToUSDC(ethers.parseEther("1"), 0);
    // await swap_res.wait();

    const amount = ethers.parseUnits("100", 6);
    const LP = await ethers.getContractFactory("LiquidityPool");
    const lP = await LP.deploy(
      await tUSDC.getAddress(),
      await central_account.getAddress(),
      amount
    );
    await central_account.connect(owner).setLP(await lP.getAddress());

    // // console.log(await tUSDC.balanceOf(await central_account.getAddress()));

    await central_account.connect(TRA).getTraderDebt(ethers.parseUnits("1",6));

    await expect(central_account.connect(TRA).getTraderDebt(ethers.parseUnits("1000000",6)))
      .to.be.reverted;

    // swap_res = await swap_contract.connect(TRA).swapUSDCToWETH(amount, 0);
    // await swap_res.wait();

    // console.log("after ",await tUSDC.balanceOf(await central_account.getAddress()));
    // console.log(await central_account.countUSDCTraders());

    // await expect(central_account.connect(TRA).availableUSDC())
    //   .to.be.reverted;

  });

});


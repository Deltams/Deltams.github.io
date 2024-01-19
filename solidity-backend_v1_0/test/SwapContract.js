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

describe('Test Swap Contract', () => {

  let uniswap;
  let address;
  let other_contract;
  let swap_contract;
  const ONE_USDC = 1_000_000;
  let tWETH;
  let tUSDC; 
  let central_account;

  before(async function() {
    [owner, other_contract, address,uniswap] = await ethers.getSigners();

    // const TUSDC = await ethers.getContractFactory("TUSDC");
    // tUSDC = await TUSDC.deploy();

    tUSDC = getContractInstance(CONTRACT_ADDRESSES.USDC,erc20Artifact,uniswap);

    // const TWETH = await ethers.getContractFactory("TWETH");
    // tWETH = await TWETH.deploy();

    tWETH = getContractInstance(CONTRACT_ADDRESSES.WETH,wethArtifact,uniswap);
    
    const CA = await ethers.getContractFactory("CentralAccount");
    central_account = await CA.deploy(await tUSDC.getAddress(), await tWETH.getAddress());

    // console.log(await tWETH.balanceOf(uniswap));
    // console.log(await tWETH.balanceOf(await central_account.getAddress()));
    
    const SC = await ethers.getContractFactory("SwapContract");
    swap_contract = await SC.deploy(await central_account.getAddress(), other_contract, await tUSDC.getAddress(), await tWETH.getAddress());
    await central_account.connect(owner).setSC(await swap_contract.getAddress());


    // const amountOtherUSDC = ethers.parseUnits("5000", 6);
    // await tUSDC.transfer(await central_account.getAddress(), amountOtherUSDC); // Переводим другому аккаунту 5000 USDC для дальнейших тестов

    // const amountOtherWETH = ethers.parseUnits("5000", 18);
    // await tWETH.transfer(await central_account.getAddress(), amountOtherWETH); // Переводим другому аккаунту 5000 WETH для дальнейших тестов

    const txW = await tWETH.deposit({ value: ethers.parseEther('5') });
    await txW.wait();

    await tWETH.connect(uniswap).transfer(await central_account.getAddress(), ethers.parseEther('5'));

    assert.equal(hre.ethers.formatEther(await tWETH.balanceOf(await central_account.getAddress())), '5.0', 'Initial WETH balance should be 5.0');
    assert.equal(hre.ethers.formatUnits(await tUSDC.balanceOf(await central_account.getAddress()),6), '0.0', 'Initial USDC balance should be 0');

  });

  it("should be deployed", async function (){
    chai.expect(await swap_contract.getAddress()).to.be.properAddress;
  });

  it("create deposit in tWETH", async function() {

    //const txW = await tWETH.deposit({ value: ethers.parseEther('5') });

    await expect(tWETH.connect(address).deposit({ value: ethers.parseEther('5') })).to.not.be.reverted;

    // console.log("b",txW);
    // await txW.wait();
    // console.log("a",txW);

    // // console.log(await tWETH.balanceOf(uniswap));
    // // console.log(await tWETH.balanceOf(await central_account.getAddress()));

    // assert.equal(txW.value.toString(), ethers.parseEther('5'), 'Initial WETH balance should be 5.0');

    // await tWETH.connect(uniswap).transfer(address, ethers.parseEther('5'));

    // console.log(await tWETH.balanceOf(uniswap));
    // console.log(await tWETH.balanceOf(address));

    // assert.equal(hre.ethers.formatEther(await tWETH.balanceOf(address)), '5.0', 'Initial WETH balance should be 5.0');
    // assert.equal(hre.ethers.formatUnits(await tUSDC.balanceOf(address),6), '0.0', 'Initial USDC balance should be 0');

  });

  it("quote WETH to USDC", async function (){

    await expect(tWETH.connect(uniswap).deposit({ value: ethers.parseEther('5') })).to.not.be.reverted;

    const amountWETH = "1.0";
    const amountIn = hre.ethers.parseEther(amountWETH); // one WETH

    // create SwapContract with USDC and WETH Uniswap
    const SC = await ethers.getContractFactory("SwapContract");
    swap_contract = await SC.deploy(await central_account.getAddress(), other_contract, CONTRACT_ADDRESSES.USDC,  CONTRACT_ADDRESSES.WETH);
    await central_account.connect(owner).setSC(await swap_contract.getAddress());

    // get Quote
    const quote = await swap_contract.quoteWETHToUSDC(amountIn);
    const convertedQuote = hre.ethers.formatUnits(quote,6);
    console.log("FOR ",amountWETH," WETH GET ",convertedQuote," USDC");

    assert.isAbove(parseFloat(convertedQuote), 0, 'returned value should be bigger than 0');

  });

  // it("quote USDC to WETH", async function (){

  //   const amountWETH = "1.0";
  //   const amountIn = hre.ethers.parseUnits(amountWETH,6); // one WETH

  //   // create SwapContract with USDC and WETH Uniswap
  //   const SC = await ethers.getContractFactory("SwapContract");
  //   swap_contract = await SC.deploy(await central_account.getAddress(), other_contract, CONTRACT_ADDRESSES.USDC,  CONTRACT_ADDRESSES.WETH);
  //   await central_account.connect(owner).setSC(await swap_contract.getAddress());

  //   // get Quote
  //   const quote = await swap_contract.quoteWETHToUSDC(amountIn);
  //   console.log(quote);
  //   const convertedQuote = hre.ethers.formatUnits(quote,18);
  //   console.log("FOR ",amountWETH," WETH GET ",convertedQuote," USDC");

  //   assert.isAbove(parseFloat(convertedQuote), 0, 'returned value should be bigger than 0');

  // });

  it("swap WETH to USDC", async function (){
    const amountIn = hre.ethers.parseEther('1'); // one WETH

    let wethBalanceBefore = await tWETH.balanceOf(await central_account.getAddress());
    let usdcBalanceBefore = await tUSDC.balanceOf(await central_account.getAddress());

    console.log("before ",wethBalanceBefore,usdcBalanceBefore);

    const swap_res = await swap_contract.connect(other_contract).swapWETHToUSDC(amountIn, 0);
    await swap_res.wait();

    wethBalance = await tWETH.balanceOf(await central_account.getAddress());
    usdcBalance = await tUSDC.balanceOf(await central_account.getAddress());

    assert.isBelow(parseFloat(hre.ethers.formatEther(wethBalance)), parseFloat(hre.ethers.formatEther(wethBalanceBefore)), 'WETH balance of CentralAccount should have decreased');
    assert.isAbove(parseFloat(hre.ethers.formatUnits(usdcBalance, 6)), parseFloat(hre.ethers.formatUnits(usdcBalanceBefore,6)), 'USDT balance of CentralAccount should have increased');

    console.log("central_account");
    console.log("after ",wethBalance,usdcBalance);

    wethBalance = await tWETH.balanceOf(await swap_contract.getAddress());
    usdcBalance = await tUSDC.balanceOf(await swap_contract.getAddress());

    console.log("swap_contract");
    console.log("after ",wethBalance,usdcBalance);

    assert.equal(hre.ethers.formatEther(await tWETH.balanceOf(await swap_contract.getAddress())), '0.0', 'WETH balance of SwapContract should be 0.0');
    assert.equal(hre.ethers.formatUnits(await tUSDC.balanceOf(await swap_contract.getAddress()),6), '0.0', 'USDC balance of SwapContract should be 0');

  });

  it("quote WETH to USDC", async function (){
    const amountWETH = "1.0";
    const amountIn = hre.ethers.parseEther(amountWETH); // one WETH

    // create SwapContract with USDC and WETH Uniswap
    const SC = await ethers.getContractFactory("SwapContract");
    swap_contract = await SC.deploy(await central_account.getAddress(), other_contract, CONTRACT_ADDRESSES.USDC,  CONTRACT_ADDRESSES.WETH);
    await central_account.connect(owner).setSC(await swap_contract.getAddress());

    const quoteZero = await swap_contract.quoteWETHToUSDC(0);

    assert.equal(parseFloat(quoteZero),0,"returned value should be equal to 0");

    // get Quote
    const quote = await swap_contract.quoteWETHToUSDC(amountIn);
    const convertedQuote = hre.ethers.formatUnits(quote,6);
    console.log("FOR ",amountWETH," WETH GET ",convertedQuote," USDC");

    assert.isAbove(parseFloat(convertedQuote), 0, 'returned value should be bigger than 0');

  });

  it("swap USDC to WETH", async function (){
    const amountIn = hre.ethers.parseUnits('1',6); // one USDC

    let wethBalanceBefore = await tWETH.balanceOf(await central_account.getAddress());
    let usdcBalanceBefore = await tUSDC.balanceOf(await central_account.getAddress());

    console.log("before ",wethBalanceBefore,usdcBalanceBefore);  
    
    const swap_res = await swap_contract.connect(other_contract).swapUSDCToWETH(amountIn, 0);
    await swap_res.wait();
    // console.log(swap_res);

    wethBalance = await tWETH.balanceOf(await central_account.getAddress());
    usdcBalance = await tUSDC.balanceOf(await central_account.getAddress());

    assert.isAbove(parseFloat(hre.ethers.formatEther(wethBalance)), parseFloat(hre.ethers.formatEther(wethBalanceBefore)), 'WETH balance of CentralAccount should have increased');
    assert.isBelow(parseFloat(hre.ethers.formatUnits(usdcBalance, 6)), parseFloat(hre.ethers.formatUnits(usdcBalanceBefore,6)), 'USDT balance of CentralAccount should have decreased');

    console.log("central_account");
    console.log("after ",wethBalance,usdcBalance);

    wethBalance = await tWETH.balanceOf(await swap_contract.getAddress());
    usdcBalance = await tUSDC.balanceOf(await swap_contract.getAddress());

    console.log("swap_contract");
    console.log("after ",wethBalance,usdcBalance);

    assert.equal(hre.ethers.formatEther(await tWETH.balanceOf(await swap_contract.getAddress())), '0.0', 'WETH balance of SwapContract should be 0.0');
    assert.equal(hre.ethers.formatUnits(await tUSDC.balanceOf(await swap_contract.getAddress()),6), '0.0', 'USDC balance of SwapContract should be 0');

  });

  it("require TRA for swapWETHToUSDC", async function (){
    
    const amountIn = ethers.parseEther("1");

    await expect(swap_contract.connect(owner).swapWETHToUSDC(amountIn, 0)).to.be.revertedWith('access not required');

  });

  it("require TRA for swapUSDCToWETH", async function (){
    
    const amountIn = ethers.parseUnits("1",6);

    await expect(swap_contract.connect(owner).swapUSDCToWETH(amountIn, 0)).to.be.revertedWith('access not required');

  });



});


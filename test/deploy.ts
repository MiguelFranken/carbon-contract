import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { Carbon, TestToken } from "../typechain";
import { BigNumber, Signer } from "ethers";
import { setBalance } from "./helper";

import * as dotenv from "dotenv";
dotenv.config();

export interface Contracts {
  carbon: Carbon;
  testTokenOne: TestToken;
  testTokenTwo: TestToken;
}

/**
 * Deploys the OrderStatisticsTreeLib and Carbon contract.
 * Also links the library and the Carbon contract.
 */
export async function deployContracts(signer: Signer) {
  // deploy libraries
  const OrderStatisticsTreeLib = await ethers.getContractFactory(
    "OrderStatisticsTreeLib",
    signer
  );
  const orderStatisticsTreeLib = await OrderStatisticsTreeLib.deploy();
  await orderStatisticsTreeLib.deployed();

  const CarbonLib = await ethers.getContractFactory("CarbonLib", signer);
  const carbonLib = await CarbonLib.deploy();
  await carbonLib.deployed();

  const CarbonWhitelistingLib = await ethers.getContractFactory(
    "CarbonWhitelistingLib",
    signer
  );
  const carbonWhitelistingLib = await CarbonWhitelistingLib.deploy();
  await carbonWhitelistingLib.deployed();

  const carbonLibAddress = process.env.USE_DEPLOYED
    ? "0xf31E24AeD8eB6Dd2218683B0bCE29Ed3387b16B9"
    : carbonLib.address;
  const orderStatisticsTreeLibAddress = process.env.USE_DEPLOYED
    ? "0x0A78bB5c3F3Bf99f78c2D440f2C10712Ce413109"
    : orderStatisticsTreeLib.address;

  // deploy crypto cocks contract
  const Carbon = await ethers.getContractFactory("Carbon", {
    libraries: {
      OrderStatisticsTreeLib: orderStatisticsTreeLibAddress,
      CarbonLib: carbonLibAddress,
      CarbonWhitelistingLib: carbonWhitelistingLib.address,
    },
    signer,
  });
  const carbon = (await Carbon.deploy()) as Carbon;
  await carbon.deployed();

  return carbon;
}

/**
 * Deploys the test token contracts
 */
export async function deployTestTokenContracts(signer: Signer) {
  // deploy TestTokenOne contract
  const TestTokenOne = await ethers.getContractFactory("TestToken", signer);
  const testTokenOne = (await TestTokenOne.deploy()) as TestToken;
  await testTokenOne.deployed();

  // deploy TestTokenTwo contract
  const TestTokenTwo = await ethers.getContractFactory("TestToken", signer);
  const testTokenTwo = (await TestTokenTwo.deploy()) as TestToken;
  await testTokenTwo.deployed();

  return [testTokenOne, testTokenTwo];
}

/**
 * Deploys the OrderStatisticsTreeLib and Carbon contract.
 * Also links the library and the Carbon contract.
 */
export async function deploy(owner: SignerWithAddress): Promise<Contracts> {
  await setBalance(owner, BigNumber.from(ethers.utils.parseEther("10"))); // make sure owner has enough funds
  const contracts = {} as Contracts;
  contracts.carbon = await deployContracts(owner);
  const [contract1, contract2] = await deployTestTokenContracts(owner);
  contracts.testTokenOne = contract1;
  contracts.testTokenTwo = contract2;
  return contracts;
}

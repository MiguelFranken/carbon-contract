import * as dotenv from "dotenv";
import { ethers } from "hardhat";
import { Carbon } from "../typechain";
import {
  saveABIJson,
  saveAddressesJson,
  saveChainJson,
  saveOwnerJson,
} from "./generator";
dotenv.config();

async function main() {
  // deploy libraries
  const OrderStatisticsTreeLib = await ethers.getContractFactory(
    "OrderStatisticsTreeLib"
  );
  const orderStatisticsTreeLib = await OrderStatisticsTreeLib.deploy();
  await orderStatisticsTreeLib.deployed();
  console.log(
    "OrderStatisticsTreeLib contract deployed to:",
    orderStatisticsTreeLib.address
  );

  const CarbonLib = await ethers.getContractFactory("CarbonLib");
  const carbonLib = await CarbonLib.deploy();
  await carbonLib.deployed();
  console.log("CarbonLib contract deployed to:", carbonLib.address);

  const CarbonWhitelistingLib = await ethers.getContractFactory(
    "CarbonWhitelistingLib"
  );
  const carbonWhitelistingLib = await CarbonWhitelistingLib.deploy();
  await carbonWhitelistingLib.deployed();
  console.log(
    "CarbonWhitelistingLib contract deployed to:",
    carbonWhitelistingLib.address
  );

  // deploy carbon contract
  const Carbon = await ethers.getContractFactory("Carbon", {
    libraries: {
      OrderStatisticsTreeLib: orderStatisticsTreeLib.address,
      CarbonLib: carbonLib.address,
      CarbonWhitelistingLib: carbonWhitelistingLib.address,
    },
  });
  const carbon = (await Carbon.deploy()) as Carbon;
  await carbon.deployed();
  console.log("Carbon contract deployed to:", carbon.address);

  const generate = process.env.GENERATE === "true";

  if (generate) {
    const signers = await ethers.getSigners();
    const owner = signers[0];
    const network = await ethers.getDefaultProvider().getNetwork();
    const chainId = network.chainId;

    saveOwnerJson(owner.address);
    saveChainJson(chainId);
    saveAddressesJson({
      Carbon: carbon.address,
    });
    saveABIJson("Carbon");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

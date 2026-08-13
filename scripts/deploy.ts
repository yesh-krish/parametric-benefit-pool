import { network } from "hardhat";

const { ethers } = await network.connect();

const [deployer, oracle] = await ethers.getSigners();

const THRESHOLD = 800;

console.log("Deploying BenefitPool...");
console.log("Deployer:", deployer.address);
console.log("Oracle:", oracle.address);
console.log("Threshold:", THRESHOLD / 100, "inches");

const benefitPool = await ethers.deployContract(
  "BenefitPool",
  [THRESHOLD, oracle.address]
);

await benefitPool.waitForDeployment();

const address = await benefitPool.getAddress();

console.log("");
console.log("BenefitPool deployed successfully");
console.log("Contract address:", address);
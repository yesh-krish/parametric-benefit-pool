import { network } from "hardhat";

const { ethers } = await network.create({
  network: "localhost",
});

const CONTRACT_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const RAINFALL = 7.5;

const [, oracle] = await ethers.getSigners();

const scaledValue = Math.round(RAINFALL * 100);

const benefitPool = await ethers.getContractAt(
  "BenefitPool",
  CONTRACT_ADDRESS,
  oracle
);

console.log(`Submitting rainfall: ${RAINFALL.toFixed(2)} inches`);

const tx = await benefitPool.updateOracleValue(scaledValue);

console.log("Transaction:", tx.hash);

await tx.wait();

const storedValue = await benefitPool.oracleValue();
const threshold = await benefitPool.threshold();
const triggered = await benefitPool.isTriggered();

console.log("Transaction confirmed");

console.log(
  "Stored rainfall:",
  (Number(storedValue) / 100).toFixed(2),
  "inches"
);

console.log(
  "Threshold:",
  (Number(threshold) / 100).toFixed(2),
  "inches"
);

console.log(
  "Status:",
  triggered ? "TRIGGERED" : "NOT TRIGGERED"
);
import { network } from "hardhat";

const { ethers } = await network.create({
  network: "localhost",
});

const CONTRACT_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

const rainfallInput = process.env.RAINFALL;

if (!rainfallInput) {
  throw new Error(
    "Missing RAINFALL environment variable. Example: $env:RAINFALL='7.5'"
  );
}

const rainfall = Number(rainfallInput);

if (!Number.isFinite(rainfall) || rainfall < 0) {
  throw new Error("RAINFALL must be a non-negative number.");
}

const scaledValue = Math.round(rainfall * 100);

const [, oracle] = await ethers.getSigners();

const benefitPool = await ethers.getContractAt(
  "BenefitPool",
  CONTRACT_ADDRESS,
  oracle
);

console.log("");
console.log("Mock Oracle");
console.log("-----------");
console.log(`Submitting rainfall: ${rainfall.toFixed(2)} inches`);

const tx = await benefitPool.updateOracleValue(scaledValue);

console.log(`Transaction: ${tx.hash}`);

await tx.wait();

const storedValue = await benefitPool.oracleValue();
const threshold = await benefitPool.threshold();
const triggered = await benefitPool.isTriggered();

console.log("Transaction confirmed");
console.log(
  `Stored rainfall: ${(Number(storedValue) / 100).toFixed(2)} inches`
);
console.log(
  `Threshold: ${(Number(threshold) / 100).toFixed(2)} inches`
);
console.log(
  `Status: ${triggered ? "TRIGGERED" : "NOT TRIGGERED"}`
);
console.log("");
import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("BenefitPool", function () {
  async function deployBenefitPool() {
    const [deployer, oracle, alice, bob] =
      await ethers.getSigners();

    const benefitPool = await ethers.deployContract(
      "BenefitPool",
      [800, oracle.address]
    );

    await benefitPool.waitForDeployment();

    return {
      benefitPool,
      deployer,
      oracle,
      alice,
      bob,
    };
  }

  describe("Contributions", function () {
    it("starts with a total contribution of zero", async function () {
      const { benefitPool } = await deployBenefitPool();

      expect(
        await benefitPool.totalContributions()
      ).to.equal(0n);
    });

    it("records a user's contribution", async function () {
      const { benefitPool, alice } =
        await deployBenefitPool();

      await benefitPool
        .connect(alice)
        .contribute(100);

      expect(
        await benefitPool.contributions(alice.address)
      ).to.equal(100n);

      expect(
        await benefitPool.totalContributions()
      ).to.equal(100n);
    });

    it("accumulates multiple contributions from the same user", async function () {
      const { benefitPool, alice } =
        await deployBenefitPool();

      await benefitPool
        .connect(alice)
        .contribute(100);

      await benefitPool
        .connect(alice)
        .contribute(50);

      expect(
        await benefitPool.contributions(alice.address)
      ).to.equal(150n);

      expect(
        await benefitPool.totalContributions()
      ).to.equal(150n);
    });

    it("tracks contributions from different users", async function () {
      const { benefitPool, alice, bob } =
        await deployBenefitPool();

      await benefitPool
        .connect(alice)
        .contribute(100);

      await benefitPool
        .connect(bob)
        .contribute(50);

      expect(
        await benefitPool.contributions(alice.address)
      ).to.equal(100n);

      expect(
        await benefitPool.contributions(bob.address)
      ).to.equal(50n);

      expect(
        await benefitPool.totalContributions()
      ).to.equal(150n);
    });

    it("rejects a zero contribution", async function () {
      const { benefitPool } = await deployBenefitPool();

      await expect(
        benefitPool.contribute(0)
      ).to.be.revertedWithCustomError(
        benefitPool,
        "InvalidContribution"
      );
    });
  });

  describe("Oracle", function () {
    it("stores the configured threshold", async function () {
      const { benefitPool } = await deployBenefitPool();

      expect(
        await benefitPool.threshold()
      ).to.equal(800n);
    });

    it("stores the authorized oracle address", async function () {
      const { benefitPool, oracle } =
        await deployBenefitPool();

      expect(
        await benefitPool.oracle()
      ).to.equal(oracle.address);
    });

    it("allows the oracle to update the external value", async function () {
      const { benefitPool, oracle } =
        await deployBenefitPool();

      await benefitPool
        .connect(oracle)
        .updateOracleValue(750);

      expect(
        await benefitPool.oracleValue()
      ).to.equal(750n);
    });

    it("rejects oracle updates from unauthorized users", async function () {
      const { benefitPool, alice } =
        await deployBenefitPool();

      await expect(
        benefitPool
          .connect(alice)
          .updateOracleValue(820)
      ).to.be.revertedWithCustomError(
        benefitPool,
        "UnauthorizedOracle"
      );
    });
  });

  describe("Trigger", function () {
    it("is not triggered below the threshold", async function () {
      const { benefitPool, oracle } =
        await deployBenefitPool();

      await benefitPool
        .connect(oracle)
        .updateOracleValue(799);

      expect(
        await benefitPool.isTriggered()
      ).to.equal(false);
    });

    it("is triggered exactly at the threshold", async function () {
      const { benefitPool, oracle } =
        await deployBenefitPool();

      await benefitPool
        .connect(oracle)
        .updateOracleValue(800);

      expect(
        await benefitPool.isTriggered()
      ).to.equal(true);
    });

    it("is triggered above the threshold", async function () {
      const { benefitPool, oracle } =
        await deployBenefitPool();

      await benefitPool
        .connect(oracle)
        .updateOracleValue(820);

      expect(
        await benefitPool.isTriggered()
      ).to.equal(true);
    });
  });
});
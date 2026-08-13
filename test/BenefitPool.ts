import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("BenefitPool", function () {
    async function deployBenefitPool() {
        const benefitPool = await ethers.deployContract("BenefitPool");

        await benefitPool.waitForDeployment();

        return { benefitPool };
    }

    it("starts with a total contribution of zero", async function () {
        const { benefitPool } = await deployBenefitPool();

        expect(await benefitPool.totalContributions()).to.equal(0n);
    });

    it("records a user's contribution", async function () {
        const { benefitPool } = await deployBenefitPool();

        const [user] = await ethers.getSigners();

        await benefitPool.connect(user).contribute(100);

        expect(
            await benefitPool.contributions(user.address)
        ).to.equal(100n);

        expect(
            await benefitPool.totalContributions()
        ).to.equal(100n);
    });

    it("accumulates multiple contributions from the same user", async function () {
        const { benefitPool } = await deployBenefitPool();

        const [user] = await ethers.getSigners();

        await benefitPool.connect(user).contribute(100);
        await benefitPool.connect(user).contribute(50);

        expect(
            await benefitPool.contributions(user.address)
        ).to.equal(150n);

        expect(
            await benefitPool.totalContributions()
        ).to.equal(150n);
    });

    it("tracks contributions from different users", async function () {
        const { benefitPool } = await deployBenefitPool();

        const [alice, bob] = await ethers.getSigners();

        await benefitPool.connect(alice).contribute(100);
        await benefitPool.connect(bob).contribute(50);

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
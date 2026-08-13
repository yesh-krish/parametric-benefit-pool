// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BenefitPool {
    uint256 public totalContributions;

    mapping(address => uint256) public contributions;

    error InvalidContribution();

    event ContributionRecorded(
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    );

    function contribute(uint256 amount) external {
        if (amount == 0) {
            revert InvalidContribution();
        }

        contributions[msg.sender] += amount;
        totalContributions += amount;

        emit ContributionRecorded(
            msg.sender,
            amount,
            totalContributions
        );
    }
}
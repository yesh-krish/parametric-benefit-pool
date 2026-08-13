// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract BenefitPool {
    uint256 public totalContributions;

    mapping(address => uint256) public contributions;

    address public immutable oracle;
    uint256 public immutable threshold;
    uint256 public oracleValue;

    error InvalidContribution();
    error UnauthorizedOracle();

    event ContributionRecorded(
        address indexed contributor,
        uint256 amount,
        uint256 newTotal
    );

    event OracleValueUpdated(
        uint256 value,
        bool triggered
    );

    constructor(uint256 _threshold, address _oracle) {
        require(_oracle != address(0), "Invalid oracle");

        threshold = _threshold;
        oracle = _oracle;
    }

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

    function updateOracleValue(uint256 value) external {
        if (msg.sender != oracle) {
            revert UnauthorizedOracle();
        }

        oracleValue = value;

        emit OracleValueUpdated(
            value,
            isTriggered()
        );
    }

    function isTriggered() public view returns (bool) {
        return oracleValue >= threshold;
    }
}
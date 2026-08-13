# Parametric Benefit Pool

A local blockchain prototype demonstrating a simple digital benefit pool driven by wallet contributions and external oracle data.

The prototype implements two primary flows:

**User Interface → Wallet → Smart Contract**

and

**Mock External Data → Oracle → Smart Contract → User Interface**

The system uses simulated values only. No real cryptocurrency, stablecoins, or production blockchain networks are used.

## Overview

A user connects a MetaMask wallet to the web interface and records a contribution in simulated test units.

A separate authorized mock oracle submits an external value representing rainfall. The smart contract compares that value against a fixed threshold and reports whether the triggering condition has been reached.

Example:

```text
Contribution: 100 test units

Rainfall: 7.50 inches
Threshold: 8.00 inches
Status: Not Triggered

Rainfall: 8.20 inches
Threshold: 8.00 inches
Status: Triggered
```

The contract does not transfer money when the condition is triggered. The triggered state only represents whether the predefined eligibility condition has been reached.

## Technology Stack

### Smart Contract

* Solidity
* Hardhat
* ethers.js

### Frontend

* React
* TypeScript
* Vite
* ethers.js
* MetaMask

### Local Blockchain

* Hardhat local Ethereum-compatible network
* Chain ID: `31337`

### Testing

* Hardhat
* Mocha
* Chai
* ethers.js

## Architecture

```text
                    Hardhat Local Blockchain
                 ┌─────────────────────────────┐
                 │                             │
User             │       BenefitPool.sol       │
 │               │                             │
 ▼               │ totalContributions          │
React UI ──────► │ contributions[address]      │
 │               │ oracleValue                 │
 ▼               │ threshold                   │
MetaMask         │ isTriggered()               │
                 │                             │
                 └──────────────▲──────────────┘
                                │
                                │ updateOracleValue()
                                │
                         Authorized Oracle
                                ▲
                                │
                         Mock Oracle Script
```

The wallet and oracle are intentionally represented by separate local blockchain accounts.

```text
Hardhat Account #0 → contract deployer
Hardhat Account #1 → authorized oracle
Hardhat Account #2 → website user / MetaMask
```

## Smart Contract

The main contract is:

```text
contracts/BenefitPool.sol
```

The contract contains three core behaviors.

### Contributions

```solidity
contribute(uint256 amount)
```

Records a simulated contribution from the calling wallet.

The contribution is stored both:

* per wallet using `contributions[address]`
* globally using `totalContributions`

The contract identifies the contributor using `msg.sender`.

No ETH or tokens are transferred. Contributions are simulated accounting values only.

### Oracle Updates

```solidity
updateOracleValue(uint256 value)
```

Updates the latest external value.

Only the designated oracle address configured during deployment can call this function.

Unauthorized callers revert with:

```solidity
UnauthorizedOracle()
```

### Trigger Logic

```solidity
isTriggered()
```

Returns whether:

```text
oracleValue >= threshold
```

The rainfall value is represented using scaled integers:

```text
7.50 inches → 750
8.00 inches → 800
8.20 inches → 820
```

This avoids relying on floating-point arithmetic in the contract.

## Contract Events

The contract emits:

```solidity
ContributionRecorded(...)
```

when a contribution is successfully recorded.

It also emits:

```solidity
OracleValueUpdated(...)
```

when the oracle submits a new external value.

The React application listens for these events so contract data can refresh automatically after blockchain state changes.

## Automated Testing

The project contains an automated contract test suite in:

```text
test/BenefitPool.ts
```

The current suite contains **15 passing tests**.

Coverage includes:

* initial pool value
* single-user contributions
* repeated contributions
* multiple users
* zero-value contribution rejection
* configured threshold
* configured oracle address
* authorized oracle updates
* unauthorized oracle update rejection
* below-threshold behavior
* exact-threshold behavior
* above-threshold behavior
* contribution event emission
* oracle event emission
* invalid zero-address oracle deployment

Run the complete test suite with:

```bash
npx hardhat test
```

Expected result:

```text
15 passing
```

## Running the Prototype

### Prerequisites

Install:

* Node.js
* npm
* MetaMask browser extension

Clone the repository and install the root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### 1. Start the Local Blockchain

From the project root:

```bash
npx hardhat node
```

Leave this terminal running.

The local blockchain is available at:

```text
http://127.0.0.1:8545
```

with chain ID:

```text
31337
```

### 2. Configure MetaMask

Add a custom network:

```text
Network name: Hardhat Local
RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency symbol: ETH
```

Import Hardhat Account #2 into MetaMask using the disposable private key printed by `npx hardhat node`.

These accounts and private keys are for local development only and should never be used with real funds.

### 3. Deploy the Contract

In a second terminal:

```bash
npx hardhat run scripts/deploy.ts --network localhost
```

The script prints:

* deployer address
* authorized oracle address
* trigger threshold
* deployed contract address

The current contract address must be used by both:

```text
frontend/src/contract.ts
scripts/updateOracle.ts
```

If the Hardhat node is restarted, the local blockchain state is reset and the contract must be deployed again.

### 4. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite development URL, normally:

```text
http://localhost:5173
```

Select the imported Hardhat user account and the `Hardhat Local` network in MetaMask.

Click:

```text
Connect Wallet
```

The interface displays the connected wallet address.

### 5. Record a Contribution

Enter:

```text
100
```

and click:

```text
Contribute
```

MetaMask requests transaction authorization.

After confirmation, the interface updates:

```text
Pool Total: 100 test units
Your Contribution: 100 test units
```

The application also displays the latest transaction hash.

### 6. Submit Mock Oracle Data

From PowerShell:

```powershell
$env:RAINFALL="7.5"
npx hardhat run scripts/updateOracle.ts --network localhost
```

The oracle script submits:

```text
Rainfall: 7.50 inches
```

The application displays:

```text
Threshold: 8.00 inches
Status: Not Triggered
```

Then run:

```powershell
$env:RAINFALL="8.2"
npx hardhat run scripts/updateOracle.ts --network localhost
```

The application updates to:

```text
Rainfall: 8.20 inches
Threshold: 8.00 inches
Status: Triggered
```

The frontend listens for the contract's oracle update event and refreshes the displayed state automatically. A manual sync option is also available as a fallback.

## Fully Implemented Components

The following components are fully implemented in the local prototype:

* React web interface
* MetaMask wallet connection
* local Hardhat blockchain
* Solidity smart contract
* per-wallet contribution tracking
* total contribution tracking
* authorized oracle access control
* mock external-data updates
* deterministic trigger evaluation
* contract events
* live frontend contract reads
* transaction confirmation feedback
* automated contract tests

## Simulated Components

The following are intentionally simulated:

* contribution units
* rainfall data
* blockchain accounts
* cryptocurrency balances
* oracle data source
* financial benefit eligibility
* blockchain network

No real assets are used.

## Security and Design Decisions

### Oracle Authorization

The contract restricts external-value updates to a designated oracle address.

This restriction is enforced inside the smart contract rather than only in the user interface.

### No Private-Key Management

The web application does not manage user private keys.

MetaMask handles wallet access and transaction signing.

### No Real Assets

The prototype uses numerical accounting units rather than ETH, stablecoins, or other tokens.

### Input Validation

Zero-value contributions are rejected.

### Deployment Validation

The contract rejects deployment when the oracle is configured as the zero address.

## Prototype Limitations

This prototype is intentionally small and is not production-ready.

It currently does not include:

* real stablecoins
* benefit disbursement
* withdrawals
* real oracle services
* decentralized oracle consensus
* production authentication
* multiple benefit pools
* contract upgrades
* governance
* production key management
* contract audits
* real financial calculations

The triggered state currently represents only whether the predefined external-data condition has been reached.

## What I Would Implement Next

For a production-oriented version, I would next investigate:

1. a trusted or decentralized external-data oracle;
2. audited stablecoin-based contribution and benefit logic;
3. stronger oracle administration, such as multisignature control;
4. transaction and oracle monitoring;
5. production key and secret management;
6. broader contract security testing and external audit;
7. handling stale, conflicting, or unavailable oracle data;
8. explicit benefit eligibility and disbursement rules;
9. multiple benefit pools and configurable parameters;
10. production deployment and failure-recovery procedures.

The goal of this prototype is not to solve those production concerns, but to demonstrate the interaction among a web interface, wallet, smart contract, and controlled external-data source.

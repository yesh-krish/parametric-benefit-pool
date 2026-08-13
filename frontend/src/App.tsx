import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

import {
  CONTRACT_ADDRESS,
  BENEFIT_POOL_ABI,
} from "./contract";

function App() {
  const [account, setAccount] = useState("");

  const [contribution, setContribution] = useState("100");
  const [poolTotal, setPoolTotal] = useState("0");
  const [userContribution, setUserContribution] = useState("0");

  const [oracleValue, setOracleValue] = useState("0.00");
  const [threshold, setThreshold] = useState("0.00");
  const [triggered, setTriggered] = useState(false);

  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getProvider() {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed.");
    }

    return new ethers.BrowserProvider(window.ethereum);
  }

  async function connectWallet() {
    try {
      const provider = await getProvider();

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      await loadContractData(provider, address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setStatus("Unable to connect wallet.");
    }
  }

  async function loadContractData(
    provider: ethers.BrowserProvider,
    address: string
  ) {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      BENEFIT_POOL_ABI,
      provider
    );

    const [
      total,
      personal,
      oracle,
      triggerThreshold,
      currentTriggerState,
    ] = await Promise.all([
      contract.totalContributions(),
      contract.contributions(address),
      contract.oracleValue(),
      contract.threshold(),
      contract.isTriggered(),
    ]);

    setPoolTotal(total.toString());
    setUserContribution(personal.toString());

    setOracleValue(
      (Number(oracle) / 100).toFixed(2)
    );

    setThreshold(
      (Number(triggerThreshold) / 100).toFixed(2)
    );

    setTriggered(currentTriggerState);
  }

  async function contribute() {
    if (!account) {
      setStatus("Connect your wallet before contributing.");
      return;
    }

    const amount = Number(contribution);

    if (!Number.isInteger(amount) || amount <= 0) {
      setStatus("Contribution must be a positive whole number.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Waiting for wallet confirmation...");

      const provider = await getProvider();
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BENEFIT_POOL_ABI,
        signer
      );

      const tx = await contract.contribute(amount);

      setStatus("Transaction submitted. Waiting for confirmation...");

      await tx.wait();

      await loadContractData(provider, account);

      setStatus(`Contribution of ${amount} test units confirmed.`);
    } catch (error) {
      console.error("Contribution failed:", error);
      setStatus("Transaction rejected or failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function refreshData() {
    if (!account) return;

    try {
      const provider = await getProvider();
      await loadContractData(provider, account);
    } catch (error) {
      console.error("Refresh failed:", error);
    }
  }

  useEffect(() => {
    if (!account || !window.ethereum) return;

    let contract: ethers.Contract | undefined;

    async function subscribe() {
      try {
        const provider =
          new ethers.BrowserProvider(window.ethereum);

        contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          BENEFIT_POOL_ABI,
          provider
        );

        const handleOracleUpdate = async () => {
          await loadContractData(provider, account);
        };

        const handleContribution = async () => {
          await loadContractData(provider, account);
        };

        contract.on(
          "OracleValueUpdated",
          handleOracleUpdate
        );

        contract.on(
          "ContributionRecorded",
          handleContribution
        );
      } catch (error) {
        console.error(
          "Unable to subscribe to contract events:",
          error
        );
      }
    }

    subscribe();

    return () => {
      if (contract) {
        contract.removeAllListeners();
      }
    };
  }, [account]);

  function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="brand-row">
            <div className="brand-mark">BP</div>

            <div>
              <h1>Parametric Benefit Pool</h1>
              <p className="subtitle">
                Local smart-contract prototype
              </p>
            </div>
          </div>
        </div>

        <div className="network-chip">
          <span className="network-dot" />
          Hardhat Local
        </div>
      </header>

      <main className="dashboard">
        <section className="intro-row">
          <div>
            <p className="eyebrow">
              DIGITAL BENEFIT PROTOTYPE
            </p>

            <h2>
              External conditions.
              <br />
              Deterministic benefits.
            </h2>

            <p className="intro-copy">
              A local blockchain demonstration connecting
              wallet contributions with an authorized
              external-data oracle.
            </p>
          </div>

          <div className="wallet-card">
            <p className="card-label">CONNECTED WALLET</p>

            {!account ? (
              <>
                <p className="wallet-empty">
                  No wallet connected
                </p>

                <button
                  className="primary-button"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              </>
            ) : (
              <>
                <div className="wallet-connected">
                  <span className="connection-indicator" />

                  <span>
                    {shortenAddress(account)}
                  </span>
                </div>

                <p className="wallet-note">
                  Local test account
                </p>
              </>
            )}
          </div>
        </section>

        {account && (
          <>
            <section className="metrics-grid">
              <article className="metric-card">
                <p className="card-label">
                  TOTAL POOL
                </p>

                <div className="metric-value">
                  {poolTotal}
                </div>

                <p className="metric-unit">
                  test units
                </p>
              </article>

              <article className="metric-card">
                <p className="card-label">
                  YOUR CONTRIBUTION
                </p>

                <div className="metric-value">
                  {userContribution}
                </div>

                <p className="metric-unit">
                  test units
                </p>
              </article>

              <article
                className={`metric-card status-card ${
                  triggered
                    ? "status-triggered"
                    : "status-safe"
                }`}
              >
                <p className="card-label">
                  TRIGGER STATUS
                </p>

                <div className="status-value">
                  <span className="status-dot" />

                  {triggered
                    ? "Triggered"
                    : "Not Triggered"}
                </div>

                <p className="metric-unit">
                  Based on latest oracle value
                </p>
              </article>
            </section>

            <section className="content-grid">
              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="card-label">
                      BENEFIT POOL
                    </p>

                    <h3>Record contribution</h3>
                  </div>
                </div>

                <p className="panel-description">
                  Contributions are simulated accounting
                  units recorded against the connected
                  wallet. No cryptocurrency is transferred.
                </p>

                <label
                  className="input-label"
                  htmlFor="contribution"
                >
                  Contribution amount
                </label>

                <div className="contribution-row">
                  <input
                    id="contribution"
                    type="number"
                    min="1"
                    step="1"
                    value={contribution}
                    onChange={(event) =>
                      setContribution(
                        event.target.value
                      )
                    }
                  />

                  <button
                    className="primary-button"
                    onClick={contribute}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Processing..."
                      : "Contribute"}
                  </button>
                </div>

                {status && (
                  <div className="transaction-status">
                    {status}
                  </div>
                )}
              </article>

              <article className="panel">
                <div className="panel-heading">
                  <div>
                    <p className="card-label">
                      EXTERNAL DATA
                    </p>

                    <h3>Rainfall oracle</h3>
                  </div>

                  <button
                    className="text-button"
                    onClick={refreshData}
                  >
                    Sync
                  </button>
                </div>

                <div className="oracle-list">
                  <div className="oracle-row">
                    <span>Latest rainfall</span>

                    <strong>
                      {oracleValue} in
                    </strong>
                  </div>

                  <div className="oracle-row">
                    <span>Trigger threshold</span>

                    <strong>
                      {threshold} in
                    </strong>
                  </div>

                  <div className="oracle-row">
                    <span>Condition</span>

                    <strong>
                      {Number(oracleValue) >=
                      Number(threshold)
                        ? `${oracleValue} ≥ ${threshold}`
                        : `${oracleValue} < ${threshold}`}
                    </strong>
                  </div>
                </div>

                <div
                  className={`oracle-result ${
                    triggered
                      ? "oracle-triggered"
                      : "oracle-safe"
                  }`}
                >
                  <span className="status-dot" />

                  {triggered
                    ? "Threshold reached"
                    : "Threshold not reached"}
                </div>
              </article>
            </section>

            <section className="architecture-strip">
              <p className="card-label">
                SYSTEM FLOW
              </p>

              <div className="architecture-flow">
                <span>Web Interface</span>
                <span className="arrow">→</span>
                <span>MetaMask</span>
                <span className="arrow">→</span>
                <span>BenefitPool.sol</span>
                <span className="divider">|</span>
                <span>Mock Oracle</span>
                <span className="arrow">→</span>
                <span>Contract State</span>
              </div>
            </section>
          </>
        )}
      </main>

      <footer>
        Local test environment · No real assets
      </footer>
    </div>
  );
}

export default App;
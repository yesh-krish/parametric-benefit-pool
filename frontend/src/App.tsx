import { useState } from "react";
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
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setAccount(address);

      await loadContractData(provider, address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
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

    const total = await contract.totalContributions();
    const personal = await contract.contributions(address);

    setPoolTotal(total.toString());
    setUserContribution(personal.toString());
  }

  async function contribute() {
    if (!window.ethereum || !account) {
      alert("Connect your wallet first.");
      return;
    }

    const amount = Number(contribution);

    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Enter a positive whole-number contribution.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Waiting for MetaMask confirmation...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        BENEFIT_POOL_ABI,
        signer
      );

      const tx = await contract.contribute(amount);

      setStatus("Transaction submitted. Waiting for confirmation...");

      await tx.wait();

      setStatus("Contribution confirmed.");

      await loadContractData(provider, account);
    } catch (error) {
      console.error("Contribution failed:", error);
      setStatus("Contribution failed or was rejected.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function shortenAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <main>
      <h1>Parametric Benefit Pool</h1>
      <p>Local blockchain prototype</p>

      {!account ? (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <>
          <p>
            Connected: {shortenAddress(account)}
          </p>

          <hr />

          <h2>Benefit Pool</h2>

          <p>
            Pool Total: <strong>{poolTotal}</strong> test units
          </p>

          <p>
            Your Contribution: <strong>{userContribution}</strong> test units
          </p>

          <div>
            <label htmlFor="contribution">
              Contribution amount
            </label>

            <br />

            <input
              id="contribution"
              type="number"
              min="1"
              step="1"
              value={contribution}
              onChange={(event) =>
                setContribution(event.target.value)
              }
            />

            <button
              onClick={contribute}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Contribute"}
            </button>
          </div>

          {status && <p>{status}</p>}
        </>
      )}
    </main>
  );
}

export default App;
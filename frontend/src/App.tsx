import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [account, setAccount] = useState("");

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
    } catch (error) {
      console.error("Wallet connection failed:", error);
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
        <p>
          Connected: {shortenAddress(account)}
        </p>
      )}
    </main>
  );
}

export default App;
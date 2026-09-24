"use client";

declare global {
  interface Window {
    ethereum: any;
  }
}

import { useState } from "react";
import { BrowserProvider, formatEther, parseEther } from "ethers";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [wallet, setWallet] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [risk, setRisk] = useState(50);
  const [walletBalance, setWalletBalance] = useState("");
  const [Credit , setCredit] = useState(0);
  const router = useRouter();

  async function connectAndSignup() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed");
        return;
      }

      if (!email || !investmentAmount) {
        alert("Please fill all fields");
        return;
      }

      if (Credit < 0 || Credit > 100) {
        alert("Please fill the correct credit score! ");
        return;

      }

      if (risk < 0 || risk > 100) {
        alert("Risk must be between 0 and 100");
        return;
      }
      try {
    await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
    });
    console.log("Network switch: succeeded or already correct");
} catch (switchError: any) {
    console.error("Network switch FAILED:", switchError.message, switchError.code);
}


      const provider = new BrowserProvider(window.ethereum);

      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const balance = await provider.getBalance(address);
      const balanceInEth = formatEther(balance);

      setWalletBalance(balanceInEth);

      const requestedAmount = parseEther(investmentAmount);
      console.log("requestedAmount (wei):", requestedAmount.toString());
      console.log("balance (wei):", balance.toString());
      console.log("wallet address : " , address);
      const network = await provider.getNetwork();
      console.log("Provider sees network:", network.chainId, network.name);
      if (requestedAmount > balance) {
        alert("Investment amount is higher than wallet balance");
        return;
      }

      const message = `Sign up to DAO Investment App with wallet: ${address}`;

      const signature = await signer.signMessage(message);

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          walletAddress: address,
          investmentAmount,
          risk,
          Credit ,
          walletBalance: balanceInEth,
          message,
          signature,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setWallet(address);
        alert("Signup successful");
        router.push("/Dashboard");
      } else {
        alert("Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong or signature was rejected");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #111827 50%, #064e3b 100%)",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          padding: "40px",
          borderRadius: "20px",
          width: "420px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}
      >
        <h1 style={{ color: "white", textAlign: "center" }}>
          DAO Investment Signup
        </h1>

        <p style={{ color: "#9ca3af", textAlign: "center" }}>
          Define your capital and risk profile
        </p>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="number"
          min="0"
          step="any"
          placeholder="Investment amount in ETH"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
          style={inputStyle}
        />

        <label style={{ color: "white" }}>
          Risk tolerance: {risk}/100
        </label>

        <input
          type="range"
          min="0"
          max="100"
          value={risk}
          onChange={(e) => setRisk(Number(e.target.value))}
          style={{ width: "100%", marginBottom: "20px" }}
        />


        <label style={{ color: "white" }}>
          credit score: {Credit}/100
        </label>

        <input
          type="range"
          min="0"
          max="100"
          value={Credit}
          onChange={(e) => setCredit(Number(e.target.value))}
        ></input>

        
        <button onClick={connectAndSignup} style={buttonStyle}>
          Connect MetaMask & Sign Up
        </button>

        {wallet && (
          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#064e3b",
              borderRadius: "10px",
              color: "white",
              wordBreak: "break-all",
            }}
          >
            <strong>Connected Wallet:</strong>
            <br />
            {wallet}

            <br />
            <br />

            <strong>Wallet Balance:</strong>
            <br />
            {walletBalance} ETH

            <br />
            <br />

            <strong>Investment Amount:</strong>
            <br />
            {investmentAmount} ETH

            <br />
            <br />

            <strong>Risk:</strong>
            <br />
            {risk}/100


            <br />
            <br />

            <strong>Credit Score:</strong>
            <br />
            
            {Credit}/100
             <br />
             <br />
          </div>
        )}
      </div>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "10px",
  border: "1px solid #374151",
  backgroundColor: "#1f2937",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};
"use client";
import { useRouter } from "next/navigation";
import {useState , useEffect } from "react";


export default function pofilepage(){
  const [investmentAmount , setinvestmentAmount] = useState("");
  const [risk , setrisk] = useState("");
  const router = useRouter();


  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.success) {
        setinvestmentAmount(data.investmentAmount);
        setrisk(data.risk);
      } else {
        alert("Failed to fetch profile data");
      }
    }
    fetchProfile();
  },[]);


  async function updateProfile(){
   const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body : JSON.stringify({ investmentAmount, risk }),    
   });
   const data = await res.json();
   if (!data.success) {
      alert("Failed to update profile");
      return;
    }
    
   alert ("updated!");
   router.push("/Dashboard");
    }


   function gotoDashboard() {
    router.push("/Dashboard");
  }

 return (
    <section style={sectionStyle}>
      <h2>Profile</h2>

      <label>Investment Amount</label>
      <input
        type="number"
        min="0"
        placeholder="Investment amount"
        value={investmentAmount}
        onChange={(e) => setinvestmentAmount(e.target.value)}
        style={inputStyle}
      />

      <label>Risk Level (%)</label>
      <input
        type="number"
        min="0"
        max="100"
        placeholder="Risk level"
        value={risk}
        onChange={(e) => setrisk(e.target.value)}
        style={inputStyle}
      />

      <button onClick={updateProfile} style={buttonStyle}>
        Update Profile
      </button>

      <button onClick={gotoDashboard} style={buttonStyle}>
        Back to Dashboard
      </button>
    </section>
  );
}

const sectionStyle = {
  maxWidth: "400px",
  margin: "60px auto",
  padding: "30px",
  borderRadius: "16px",
  backgroundColor: "#1f2937",
  color: "white",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "10px",
  border: "1px solid #374151",
  backgroundColor: "#111827",
  color: "white",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  backgroundColor: "#10b981",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "bold",
};

    

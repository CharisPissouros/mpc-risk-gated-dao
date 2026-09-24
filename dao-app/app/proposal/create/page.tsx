"use client";
declare global{
  interface Window { ethereum: any;
  }
}

import { useState } from "react";

import {BrowserProvider , Contract, toUtf8Bytes ,parseEther}  from "ethers";
import {CustomPluginABI} from "@/app/lib/contracts/customPluginAbi";




export default function CreateProposalPage() {
  const [Address, setAddress] = useState("");
  const [Amount, setAmount] = useState("");
  const [Description, setDescription] = useState("");
  


async function handleSubmit(e : React.FormEvent){

    e.preventDefault();  //δεν γινεται reloal στο submit
    try{
        if(!window.ethereum){
          alert("MetaMask is not installed");
          return;}
        
      const provider = new BrowserProvider(window.ethereum); //wallet connection 
      await provider.send("eth_requestAccounts" , []); //το rewuest Που γινεται στο metamask
      const signer = await provider.getSigner(); //αυτος που υπογραφει τα transactions αρα το wallet
      const PluginAddress = "0x929679FdE70032c19B26234b7F8cccc4cE023418"; //palce the real address later //plugin address 

      const new_contract = new Contract(PluginAddress , CustomPluginABI , signer) ; //δημιουργουμε ενα instance του δικου μας contract
    

      
      const metadataPL = {
        title : "Investment Proposal",
        description : Description,
      }; //φτιαχνουμε ενα json με τα metadata
      const metadataBytes = toUtf8Bytes(JSON.stringify(metadataPL)); // μετατρεπουμε το json σε bytes γιατι αυτο περιμενει το contract.

      const amountInWei = parseEther(Amount || "0");
      //call το δικο μας Plugin

      const PL = await new_contract.createInvestmentProposal(
        Address,
        amountInWei,
        "0x",
        metadataBytes,
        Description);

      await PL.wait(); //περιμενουμε Onchain επιβεβαιωση για να πουμε οτι ολοκληρωθηκε.
      alert("Proposal is created succefully");
 
      
    }catch(error){
      console.log(error)
      alert("something went wrong");
    }



 

}

   return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-800">
        <h1 className="text-3xl font-bold mb-2">Create Proposal</h1>
        <p className="text-gray-400 mb-6">
          Submit your investment data for DAO evaluation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Input #1: target wallet address */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Target Address
            </label>
            <input
              type="text"
              value={Address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="0x..."
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Input #2: amount */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Amount (€)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={Amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          {/* Input #3: description — ΝΕΟ, απαιτείται από το smart contract */}
          <div>
            <label className="block mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              value={Description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              placeholder="Why is this investment being proposed?"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition"
          >
            Submit Proposal
          </button>
        </form>
      </div>
    </main>
  );
}
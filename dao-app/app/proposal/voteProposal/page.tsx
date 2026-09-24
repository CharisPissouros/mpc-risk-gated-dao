"use client";
declare global {
   interface Window{ethereum :any ;}
  
}

import {useEffect , useState} from "react";
import { useSearchParams} from "next/navigation";
import {BrowserProvider, Contract} from "ethers";
import { getSignerTokenVotingClient ,PLUGIN_ADDRESS_ENV } from "@/app/lib/aragon-client";

export default function VoteProposalPage(){
  const searchParams =useSearchParams();
  const id = searchParams.get('id');

  const [proposal , setProposal] = useState<any>(null);
  const [loading , setLoading] = useState(true);
  

  useEffect(() =>{
    async function fetchProposal(){
      try{
          const res = await fetch (`/api/proposal?id=${id}`);
          const data = await res.json();
          setProposal(data);

      }catch(error){
        console.error(error);
      }finally {setLoading(false);}

    }fetchProposal();
  },[id]);

  async function handleVote(voteOption :number){

      try{
          if(!window.ethereum){
            alert("MetaMask is not installed");
            return;
          }
      
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      
      const contract = getSignerTokenVotingClient(signer);

      const TK = await contract.vote(id , voteOption , true);
      await TK.wait();

      alert("Vote submitted successfully");


      }catch(error){
        console.error(error);
        alert("something went wrong");
      }

  }


  return(
    <main className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Proposal #{id}</h1>

        {loading && <p>Loading...</p>}

        {!loading && !proposal && (
            <p className="text-gray-400">Proposal not found.</p>
        )}

        {!loading && proposal && (
            <div className="space-y-6">
                <p className="text-sm text-gray-400">
                    Status: {proposal.executed ? "Executed" : proposal.open ? "Open" : "Closed"}
                </p>

                <div className="text-sm text-gray-400">
                    <p>Yes: {proposal.tally?.yes?.toString()}</p>
                    <p>No: {proposal.tally?.no?.toString()}</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => handleVote(2)}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                    >
                        Vote Yes
                    </button>
                    <button
                        onClick={() => handleVote(3)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
                    >
                        Vote No
                    </button>
                </div>
            </div>
        )}
    </main>
  );

}
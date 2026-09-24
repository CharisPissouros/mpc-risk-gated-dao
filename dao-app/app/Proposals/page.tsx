"use client";

import {useEffect , useState } from "react";
import {useRouter} from "next/navigation";
import {toUtf8String} from "ethers" ;

export default function ViewProposalsPage(){
  const [proposals , setProposals] = useState<any []>([]);
  const [loading , setLoading] =useState(true);
  const router = useRouter();

   useEffect(() => {
        async function fetchProposals() {
            try{
                const res = await fetch("/api/proposal");
                const data = await res.json();
                setProposals(data);
            }catch(error){
              console.error(error);
            }finally{

              setLoading(false);
            }
        }
        fetchProposals();
    }, []);





return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Proposals</h1>

        {loading && <p>Loading proposals...</p>}

        {!loading && proposals.length === 0 && (
            <p className="text-gray-400">No proposals yet.</p>
        )}

        <div className="space-y-4">
            {Array.isArray(proposals) && proposals.map((proposal, index) => (
                <div
                    key={index}
                    onClick={() => router.push(`/proposal/voteProposal?id=${proposal.id}`)}
                    className="cursor-pointer bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-green-500 transition"
                >
                    <h2 className="text-lg font-semibold">Proposal #{proposal.id}</h2>
                    <p className="text-sm text-gray-400">
                        Status: {proposal.executed ? "Executed" : proposal.open ? "Open" : "Closed"}
                    </p>
                    <p className="text-sm text-gray-400">
                        Yes: {proposal.tally?.yes?.toString()} |
                        No: {proposal.tally?.no?.toString()} |
                        Abstain: {proposal.tally?.abstain?.toString()}
                    </p>
                </div>
            ))}
        </div>
    </main>
);}
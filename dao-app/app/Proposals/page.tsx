"use client";

import {useEffect , useState } from "react";
import {useRouter} from "next/navigation";

export default function ViewProposalsPage(){
  const [proposals , setProposals] = useState<any []>([]);
  const [loading , setLoading] =useState(true);
  const [searchId , setSearchId] = useState("");
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

     function handleSearch(){
        if (searchId.trim()=== "")return;
        router.push(`/proposal/voteProposal?id=${searchId.trim()}`);
    }






return (
        <main className="min-h-screen bg-gray-950 text-white p-8">
            <h1 className="text-3xl font-bold mb-6">Proposals</h1>

            <div className="flex gap-2 mb-6">
                <input
                    type="number"
                    min="0"
                    placeholder="Search by Proposal ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-white"
                />
                <button
                    onClick={handleSearch}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
                >
                    Search
                </button>
            </div>

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
                        </p>
                        <p className="text-sm text-gray-400">
                            Yes: {proposal.tally?.yes?.toString()} |
                            No: {proposal.tally?.no?.toString()} |
                        </p>
                    </div>
                ))}
            </div>
        </main>
    );
}
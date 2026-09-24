"use client";

import {useRouter} from "next/navigation";


export default function DashboardPage() {
  const router = useRouter();

  function gotoCreateProposal() {
    router.push("/proposal/create");

  }
  function gotoViewProposal() {
    router.push("/Proposals");
  }

  function gotoProfile() {
    router.push("/profile");
  }

 

  
   return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-8">

        <h1 className="text-4xl font-bold text-center mb-10">
          Dashboard
        </h1>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={gotoProfile}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Profile
          </button>

          <button
            onClick={gotoCreateProposal}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
          >
            Create Proposal
          </button>

          <button
            onClick={gotoViewProposal}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
          >
            View Proposals
          </button>

          
        </div>

      </div>
    </main>
);}





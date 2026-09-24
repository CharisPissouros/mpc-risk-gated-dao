import { NextRequest, NextResponse } from "next/server";
import { getReadOnlyTokenVotingClient } from "@/app/lib/aragon-client";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProposalCreatedEvents(contract: any, fromBlock: number, toBlock: number) {
    const CHUNK_SIZE = 10;
    const allEvents = [];

    for (let start = fromBlock; start <= toBlock; start += CHUNK_SIZE) {
        const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
        const filter = contract.filters.ProposalCreated();
        const events = await contract.queryFilter(filter, start, end);
        allEvents.push(...events);
        await sleep(100); // μικρή καθυστέρηση, αποφυγή rate limit
    }

    return allEvents;
}

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    const contract = getReadOnlyTokenVotingClient();

    try {
        if (id) {
            const proposal = await contract.getProposal(id);
            return NextResponse.json(proposal);
        }

        const currentBlock = await contract.runner!.provider!.getBlockNumber();
        const fromBlock = Math.max(0, currentBlock - 500); // μικρότερο, πιο διαχειρίσιμο εύρος

        const events = await getProposalCreatedEvents(contract, fromBlock, currentBlock);

        const proposals = await Promise.all(
            events.map(async (event: any) => {
                const proposalId = (event as any).args.proposalId;
                const proposal = await contract.getProposal(proposalId);
                return { id: proposalId.toString(), ...proposal };
            })
        );

        return NextResponse.json(proposals);

    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
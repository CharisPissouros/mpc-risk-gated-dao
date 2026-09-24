import { Contract ,JsonRpcProvider} from "ethers";
import {TokenVotingABI} from "@aragon/token-voting-plugin-artifacts";



export const DAO_ADDRESS_ENV = process.env.NEXT_PUBLIC_DAO_ADDRESS!;
export const PLUGIN_ADDRESS_ENV =process.env.NEXT_PUBLIC_TOKENVOTING_ADDRESS!;

export function getReadOnlyTokenVotingClient(){
    const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    return new Contract(PLUGIN_ADDRESS_ENV , TokenVotingABI , provider);
}

export function getSignerTokenVotingClient(signer : any) {
    return new Contract(PLUGIN_ADDRESS_ENV , TokenVotingABI ,signer);

}
import {NextRequest, NextResponse} from "next/server";
import crypto from "crypto";
import {prisma} from "@/app/lib/db";

export async function POST(req : NextRequest) {

    const {walletAddress} = await req.json();
    //console.log("RECEIVED:" ,JSON.stringify(walletAddress)); for debug
    //ελεγχουμε για undefined/null/κενο αλλα και για την ακριβη μορφη του wallet address (0x + 40 hex characters)
    //βαζουμε και τα 2 για πιο defensive programming.
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return NextResponse.json({error: "Invalid wallet address"}, {status: 400});
    }


const normalizedAddress = walletAddress.toLowerCase();

//crypto random οχι math random γιατι ειναι πιο ασφαλες και δεν μπορει να προβλεφθει.
const value = crypto.randomBytes(32).toString("hex");

const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

//εδω καθαριζουμε τα παλια nonce για το ιδιο wallet.
await prisma.nonce.deleteMany({
     where : {walletAddress : normalizedAddress , used : false}

});

//εδω δημιουργουμε το καινουργιο nonce για το ιδιο wallet.
await prisma.nonce.create({
    data : {
        walletAddress : normalizedAddress,
        value,
        expiresAt,
    }, 
});


return NextResponse.json({nonce : value});

}
import {NextResponse ,NextRequest} from "next/server";
import {verifyMessage} from "ethers";
import {prisma} from "@/app/lib/db";
import {createSession} from "@/app/lib/sessions";


export async function POST(req : NextRequest) {

    const {walletAddress , message , signature} = await req.json();

    let recoveredAddress: string;
    let noncefrommess: string;

try{
     recoveredAddress = verifyMessage(message , signature) ;

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json({error : "Authentication failed"}, {status : 401});
    }
    
     noncefrommess = message.split("Nonce : ")[1].trim();  
}
    
    catch (error) {
        return NextResponse.json({error : "Authentication failed"}, {status : 401});
    }

    const nonce = await prisma.nonce.findFirst({
        where : {
            walletAddress : walletAddress.toLowerCase(),
            value : noncefrommess,
            used : false,
            expiresAt : {
                gt : new Date()
            }
        }
    });

    if (!nonce) {
        return NextResponse.json({error : "Authentication failed"}, {status : 401});
    }


    const nonceupdate = await prisma.nonce.updateMany({
        where : {
             walletAddress : walletAddress.toLowerCase(),
             value : noncefrommess,
             used : false,

        },
        data : {
        used : true
        }

    });


    if (nonceupdate.count === 0 ) {
        return NextResponse.json({error : "Authentication failed"}, {status : 401});

    }


    const user = await prisma.user.findFirst ({
         where : {
             walletAddress : walletAddress.toLowerCase()
         }

    });

    if (!user) {
        return NextResponse.json({error : "Authentication failed"}, {status : 401});
    }

    await createSession(user.id);

    return NextResponse.json({success : true}, {status : 200});


}
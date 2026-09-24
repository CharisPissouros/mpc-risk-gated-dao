import {NextResponse ,NextRequest} from "next/server";
import {verifyMessage} from "ethers";
import {prisma} from "@/app/lib/db";
import {createSession} from "@/app/lib/sessions";


export async function POST(req: NextRequest) {

   const {email,walletAddress,investmentAmount,risk,Credit , message , signature} = await req.json();

    const recoveredAddress =verifyMessage(message ,signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return NextResponse.json({error : "Registration failed"}, {status : 401});
    }

    const capitalNumber = Number(investmentAmount);
    
    if (isNaN(capitalNumber)) {
    return NextResponse.json({error: "Invalid investment amount"}, {status: 400});
    }


    try{
      const user = await prisma.user.create({
          data : {
            walletAddress : walletAddress.toLowerCase(),
            email : email,
            capital : capitalNumber,
            riskLevel : risk,
            credit : Credit
          }
      });
      await createSession(user.id);
      return NextResponse.json({success : true }, {status : 201});

    }catch(error : any){
        if (error.code === 'P2002') {
            return NextResponse.json({error : "User already exists"}, {status : 409});
        }
        return NextResponse.json({error : "Registration failed"}, {status : 500});
    }








}


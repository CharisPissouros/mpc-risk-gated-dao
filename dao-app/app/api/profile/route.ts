import {getCurrentUser} from "@/app/lib/auth";
import {NextRequest ,NextResponse} from "next/server";
import {prisma} from "@/app/lib/db";

export async function GET(req : NextRequest) {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    return NextResponse.json({ investmentAmount: user.capital, risk: user.riskLevel , 
        success : true }, { status: 200 });
    }

export async function PUT(req : NextRequest) {


const {investmentAmount, risk} = await req.json();

    const userdata = await getCurrentUser();
    if (!userdata) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const capitalNumber = Number(investmentAmount);

    if(isNaN(capitalNumber)||(capitalNumber < 0 || capitalNumber > 10000)){
        return NextResponse.json({error : "Invalid investment amount"}, {status : 400});
    }else if (risk < 1 || risk > 100) {
        return NextResponse.json({error : "Invalid risk level"}, {status : 400});
    }

    try{
    const user = await prisma.user.update({

        where : {id : userdata.id},
        data : {
            capital : capitalNumber,
            riskLevel : risk
        }


    });
    return NextResponse.json({success : true }, {status : 200});

    }catch(error : any){
        return NextResponse.json({error : "Update failed"}, {status : 500});
    }
    
   
}









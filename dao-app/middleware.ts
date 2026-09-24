import { NextRequest ,NextResponse } from "next/server";

export function middleware(req : NextRequest){
    const sessionToken = req.cookies.get("session_token")?.value;

    if(!sessionToken){
        const loginUrl = new URL("/login" , req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();}

    export const config = {
        matcher : [
        "/Dashboard/:path*",
        "/profile/:path*",
        "/proposal/:path*",
        "/Proposals/:path*",
        ],

    };



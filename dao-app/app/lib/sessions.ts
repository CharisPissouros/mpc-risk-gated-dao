import crypto from "crypto";
import {cookies} from "next/headers";
import {prisma} from "@/app/lib/db";

const session_cookie_name = "session_token";


function hashsessionToken( token: string ) : string{ //δεχεται ενα string και επιστρέφει ένα string 

        return crypto 
            .createHash("sha256") //δηλωση κρυπτογραφησης
            .update(token) //actually hash the token
            .digest("hex"); //τελειωνει την διαδικασια και το επιστρεφει σε 16δικη μορφη

}





export async function createSession(userId  :  number) : Promise<void>{

    const sessionToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = hashsessionToken(sessionToken);

    const expireDate = new Date();

    expireDate.setHours(expireDate.getHours()+4);
//εδω θα επρεπε να προσθεσουμε ενα try/catch σεναρι. ωστοσο δεν θα το κανω γιατι θα μου 
//δημιουργησω περισσοτερο εδαφος για πιθανες επιθεις. Αν γινει καποιο error εδω θα ριξει error 500.

    //query 
    await prisma.sessions.create({
        data: {
            userId : userId,
            tokenHash : tokenHash,
            expires : expireDate,


        }
    });


    const cookieStore = await cookies(); //δινει προσβαση στα cookies του request και του response

    cookieStore.set(session_cookie_name, sessionToken, { //δημιουργει ενα cookie
        httpOnly: true,  //η javvascript δεν μπορει να το διαβασει
        secure: process.env.NODE_ENV === "production", //το cookie θα σταλθει μονο σε https requests
        sameSite: "lax", //προστατευει απο csrf attacks
        expires: expireDate,
        path: "/"
    }); 

}







export async function deleteSession() : Promise<void>{


    const cookieStore = await cookies();

    const sessionToken = cookieStore.get(session_cookie_name)?.value;



    if(sessionToken){
        const tokenHash = hashsessionToken(sessionToken);


        //delete query for db
        await prisma.sessions.deleteMany({
            where: {
                tokenHash : tokenHash
            }
        });



    }
    cookieStore.delete(session_cookie_name);


}




export async function getSessionTokenHash():
  Promise<string | null> {
  const cookieStore = await cookies();

  const sessionToken =
    cookieStore.get(session_cookie_name)?.value;

  if (!sessionToken) {
    return null;
  }

  return hashsessionToken(sessionToken);
}
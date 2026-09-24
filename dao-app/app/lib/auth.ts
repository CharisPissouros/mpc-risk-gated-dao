import {getSessionTokenHash} from "@/app/lib/sessions";
import {prisma} from "@/app/lib/db";

export async function getCurrentUser() {

    
    // 1. Διαβάζω το cookie 
    const tokenHash = await getSessionTokenHash();
    

    // 2. Αν δεν υπάρχει cookie
    if (!tokenHash) {
        return null;
    }

    // 3. Ψάχνω το token στη βάση
    // SELECT * FROM sessions WHERE token = sessionToken
    const session = await prisma.sessions.findFirst({
        where : {
            tokenHash : tokenHash,
            expires :  {
                gt : new Date() //ελεγχει αν το expires ειναι μεγαλυτερο απο τωρα
            }
        }

    });

    // 4. Αν δεν βρεθεί
    // return null;
    if (!session) {
        return null;
    }

    // 5. Αν βρεθεί
    // SELECT * FROM users WHERE id = session.user_id
    const user = await prisma.user.findUnique({
        where : {
            id : session.userId
        }
    });


    if(!user){
        return null;
    }

    
    // 6. Επιστρέφω τον χρήστη
    return user;
}
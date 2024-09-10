//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbGetAllUsers } from "@/lib/db/dbActions";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";
import { JWT } from "next-auth/jwt";
import { setDebugMode, debugLog } from "@/lib/utils"

export async function GET(req: NextRequest) {
    setDebugMode(true);

    const usersFromDb = await dbGetAllUsers();
    if(usersFromDb.error || !usersFromDb.data) {
        return NextResponse.json({message: "failed getting userdata"}, {status: 500});
    }

    const users = usersFromDb.data;
    users.forEach( async(user) => {
        const accountFromDB = await dbGetAccountByUserId(user.spotify_id);
        if (accountFromDB.error || accountFromDB.data === null) {
            console.error("No account found for user " + user.spotify_id);
            return;
        }
        const accountDB = accountFromDB.data;
        const { access_token, refresh_token, token_expires } = accountDB;
        if (accountDB.token_expires < Date.now() / 1000) {
            let refreshToken = await refreshAccessToken({
                accessToken: access_token,
                refreshToken: refresh_token,
            } as JWT);
            updateAccountTokenInDb(accountDB, refreshToken);
        }
    });
    return NextResponse.json({ data: playlists, message: "Hello World" });
}

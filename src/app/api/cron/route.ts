//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbGetAllUsers } from "@/lib/db/dbActions";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";
import { setDebugMode, debugLog, getAppUrl } from "@/lib/utils";
import { spotifyPut } from "@/lib/serverUtils";

export async function GET(req: NextRequest) {
    setDebugMode(true);
    const now = Date.now();

    const usersFromDb = await dbGetAllUsers();

    if (usersFromDb.error || !usersFromDb.data) {
        return NextResponse.json({ message: "failed getting userdata" }, { status: 500 });
    }
    const users = usersFromDb.data;
    let playlistCount = 0;
    let fetchCount = 0;
    let userCount = 0;

    for (const user of users) {
        console.log("User: " + user.name);
        userCount++;
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
                userId: user.spotify_id,
                accessTokenExpires: token_expires,
            });
            if (refreshToken) updateAccountTokenInDb(accountDB, refreshToken);
        }
        for (const playlist of user.playlists) {
            const { playlist_id, preferences, seeds, rules } = playlist;
            playlistCount++;
            console.log("Playlist: " + playlist.preferences.name);
            //TODO: extraxt playlistcreation and update to a function
            await fetch(getAppUrl() + "/api/spotify/playlist", {
                method: "PUT",
                body: JSON.stringify({
                    playlist_id,
                    preferences,
                    seeds,
                    rules,
                }),
            });
        }
    }

    const message = `updated ${playlistCount} Playlist for ${userCount} Users with ${fetchCount} fetches`;
    console.log(message);
    return NextResponse.json({ data: message }, { status: 200 });
}

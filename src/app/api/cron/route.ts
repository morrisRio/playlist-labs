//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbGetAllUsers } from "@/lib/db/dbActions";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";
import { setDebugMode, debugLog } from "@/lib/utils";
import { regeneratePlaylist } from "@/lib/spotifyUtils";

export async function GET(req: NextRequest) {
    try {
        setDebugMode(true);
        debugLog("CRON: GET request received", req);
        if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error(
                process.env.CRON_SECRET ? `CRON SECRET: ${process.env.CRON_SECRET}` : "CRON_SECRET not found"
            );
            console.error("secrets dont match");
            console.error("authHeader: ", req.headers.get("Authorization"));
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        const now = new Date(Date.now());

        const usersFromDb = await dbGetAllUsers();

        if (usersFromDb.error || !usersFromDb.data) {
            return NextResponse.json({ message: "failed getting userdata" }, { status: 500 });
        }
        const users = usersFromDb.data;
        let playlistCount = 0;
        let fetchCount = 0;
        let userCount = 0;

        for (const user of users) {
            debugLog("User: " + user.name);
            userCount++;
            const accountFromDB = await dbGetAccountByUserId(user.spotify_id);
            if (accountFromDB.error || accountFromDB.data === null) {
                console.error("No account found for user " + user.spotify_id);
                return;
            }
            const accountDB = accountFromDB.data;
            const { access_token, refresh_token, token_expires } = accountDB;
            debugLog("CRON: current access_token:", access_token.slice(0, 10) + "...");
            if (accountDB.token_expires < Date.now() / 1000) {
                debugLog("CRON: token expired, refreshing");
                let refreshToken = await refreshAccessToken({
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    userId: user.spotify_id,
                    accessTokenExpires: token_expires,
                });
                if (refreshToken) {
                    debugLog("CRON: new token saved to db:", refreshToken.accessToken.slice(0, 10) + "...");
                    updateAccountTokenInDb(accountDB, refreshToken);
                }
            }
            for (const playlist of user.playlists) {
                const { playlist_id, preferences, seeds, rules } = playlist;
                debugLog("Playlist: " + playlist.preferences.name);
                //TODO: could: find elegant way to check fetchCount
                if (
                    playlist.preferences.frequency === "daily" ||
                    (playlist.preferences.frequency === "weekly" && playlist.preferences.on === now.getDay()) ||
                    (playlist.preferences.frequency === "monthly" && playlist.preferences.on === now.getDate())
                    // && playlist.lastUpdated.getDay() !== now.getDay()
                ) {
                    debugLog("Updating Playlist: " + playlist.preferences.name);
                    (await regeneratePlaylist(playlist, access_token, user.spotify_id)) && playlistCount++;
                } else {
                    debugLog("Skipping Playlist: " + playlist.preferences.name);
                }
                // if (
                //     playlist.preferences.frequency === "never" ||
                //     (playlist.preferences.frequency === "daily" && playlist.lastUpdated.getDay() === now.getDay()) ||
                //     (playlist.preferences.frequency === "weekly" && playlist.preferences.on !== now.getDay()) ||
                //     (playlist.preferences.frequency === "monthly" && playlist.preferences.on !== now.getDate())
                // ) {
                //     debugLog("Skipping Playlist: " + playlist.preferences.name);
                //     continue;
                // }
                //could be by returning the count from the function by default
                //this could also help for flagging the playlist in db that trackHistory is making it hard to update
                //-> begin using additional seeds earlier to reduce fetchCount
                // (await regeneratePlaylist(playlist, access_token, user.spotify_id)) && playlistCount++;
            }
        }

        debugLog(`updated ${playlistCount} Playlist for ${userCount} Users with ${fetchCount} fetches`);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("CRON: error in GET request", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
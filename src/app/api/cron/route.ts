//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbResetDemoPlaylists } from "@/lib/db/dbActions";
import { debugLog, setDebugMode } from "@/lib/utils";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";

import exampleUser from "@/lib/db/exampleUser";

export async function POST(req: NextRequest) {
    try {
        setDebugMode(true);

        if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error(
                process.env.CRON_SECRET ? `CRON SECRET: ${process.env.CRON_SECRET}` : "CRON_SECRET not found"
            );
            console.error("secrets dont match");
            console.error("authHeader: ", req.headers.get("Authorization"));
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // get access tokens
        const accountFromDB = await dbGetAccountByUserId("karate_morris");
        if (accountFromDB.error || accountFromDB.data === null) {
            console.error("No account found for user karate_morris");
            return;
        }
        const accountDB = accountFromDB.data;

        let {
            access_token: freshAccessToken,
            refresh_token: freshRefreshToken,
            token_expires: freshTokenExpires,
        } = accountDB;
        debugLog("CRON: current access_token:", freshAccessToken.slice(0, 10) + "...");
        if (accountDB.token_expires < Date.now() / 1000) {
            debugLog("CRON: token expired, refreshing");
            let refreshToken = await refreshAccessToken({
                accessToken: freshAccessToken,
                refreshToken: freshRefreshToken,
                userId: "karate_morris",
                accessTokenExpires: freshTokenExpires,
            });
            if (refreshToken) {
                debugLog("CRON: new token saved to db:", refreshToken.accessToken.slice(0, 10) + "...");
                freshAccessToken = refreshToken.accessToken;
                freshRefreshToken = refreshToken.refreshToken;
                freshTokenExpires = refreshToken.accessTokenExpires;
                updateAccountTokenInDb(accountDB, refreshToken);
            }
        }

        for (const playlist of exampleUser.playlists) {
            await fetch("/api/spotify/playlist/restore-version", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${freshAccessToken}`,
                },
                body: JSON.stringify({
                    playlist_id: playlist.playlist_id,
                    version_index: playlist.historyToRestore,
                }),
            });
        }

        dbResetDemoPlaylists();
        console.log("Demo playlists reset");

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("CRON: error in POST request", error);

        dbLogAction("CRON", "error", false, error.message);

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function dbLogAction(arg0: string, arg1: string, arg2: boolean, message: any) {
    throw new Error("Function not implemented.");
}
//DEPRECATED
// import { dbGetAccountByUserId, dbGetAllUsers, dbUpdatePlaylist } from "@/lib/db/dbActions";
// import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";
// import { setDebugMode, debugLog } from "@/lib/utils";
// import { regeneratePlaylist } from "@/lib/spotifyUtils";

// export async function GET(req: NextRequest) {
//     try {
//         setDebugMode(false);
//         debugLog("CRON: GET request received", req);
//         if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
//             console.error(
//                 process.env.CRON_SECRET ? `CRON SECRET: ${process.env.CRON_SECRET}` : "CRON_SECRET not found"
//             );
//             console.error("secrets dont match");
//             console.error("authHeader: ", req.headers.get("Authorization"));
//             return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
//         }
//         const now = new Date(Date.now());

//         const usersFromDb = await dbGetAllUsers();

//         if (usersFromDb.error || !usersFromDb.data) {
//             return NextResponse.json({ message: "failed getting userdata" }, { status: 500 });
//         }
//         const users = usersFromDb.data;

//         for (const user of users) {
//             debugLog("User: " + user.name);
//             const accountFromDB = await dbGetAccountByUserId(user.spotify_id);
//             if (accountFromDB.error || accountFromDB.data === null) {
//                 console.error("No account found for user " + user.spotify_id);
//                 return;
//             }
//             const accountDB = accountFromDB.data;
//             const { access_token, refresh_token, token_expires } = accountDB;
//             debugLog("CRON: current access_token:", access_token.slice(0, 10) + "...");
//             if (accountDB.token_expires < Date.now() / 1000) {
//                 debugLog("CRON: token expired, refreshing");
//                 let refreshToken = await refreshAccessToken({
//                     accessToken: access_token,
//                     refreshToken: refresh_token,
//                     userId: user.spotify_id,
//                     accessTokenExpires: token_expires,
//                 });
//                 if (refreshToken) {
//                     debugLog("CRON: new token saved to db:", refreshToken.accessToken.slice(0, 10) + "...");
//                     updateAccountTokenInDb(accountDB, refreshToken);
//                 }
//             }
//             for (const playlist of user.playlists) {
//                 debugLog("Playlist: " + playlist.preferences.name);
//                 if (
//                     playlist.preferences.frequency === "daily" ||
//                     (playlist.preferences.frequency === "weekly" && playlist.preferences.on === now.getDay()) ||
//                     (playlist.preferences.frequency === "monthly" &&
//                         playlist.preferences.on === now.getDate() &&
//                         playlist.lastUpdated.getDay() !== now.getDay())
//                 ) {
//                     debugLog("Updating Playlist: " + playlist.preferences.name);
//                     const regenRes = await regeneratePlaylist(playlist, access_token, false);

//                     if (regenRes.error) {
//                         console.error("Error regenerating Playlist: ", regenRes.error);
//                         continue;
//                     }

//                     const { newTrackHistory: updatedTrackhistory } = regenRes.data;
//                     const dbSuccess = await dbUpdatePlaylist(user.spotify_id, {
//                         playlist_id: playlist.playlist_id,
//                         trackHistory: updatedTrackhistory,
//                     });
//                     debugLog("DB update success: ", dbSuccess);
//                 } else {
//                     debugLog("Skipping Playlist: " + playlist.preferences.name);
//                 }
//             }
//         }
//         return NextResponse.json({ success: true }, { status: 200 });
//     } catch (error: any) {
//         console.error("CRON: error in GET request", error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

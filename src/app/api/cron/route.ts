//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbResetDemoPlaylists } from "@/lib/db/dbActions";
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

export async function POST(req: NextRequest) {
    try {
        if (req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error(
                process.env.CRON_SECRET ? `CRON SECRET: ${process.env.CRON_SECRET}` : "CRON_SECRET not found"
            );
            console.error("secrets dont match");
            console.error("authHeader: ", req.headers.get("Authorization"));
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }
        dbResetDemoPlaylists();
        console.log("Demo playlists reset");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("CRON: error in POST request", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

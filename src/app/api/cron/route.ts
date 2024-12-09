//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbResetDemoPlaylists, dbLogAction } from "@/lib/db/dbActions";
import { createCanvasGradient, debugLog, setDebugMode } from "@/lib/utils";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";

import { exampleUser, ExamplePlaylist } from "@/lib/db/exampleUser";
import { createPlaylistDescription, trackIdsToQuery } from "@/lib/spotifyUtils";
import { spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { resolve } from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
            restoreDemoPlaylistVersion(playlist, freshAccessToken);
        }

        dbResetDemoPlaylists();
        console.log("Demo playlists reset");

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("CRON: error in POST request", error);

        dbLogAction("CRON", false, error.message);

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function restoreDemoPlaylistVersion(playlist: ExamplePlaylist, accessToken: string) {
    const trackToRestore = playlist.trackHistory[playlist.historyToRestore].tracks;

    //turn into query string
    const addQuery = trackIdsToQuery(trackToRestore);
    const addBody = {
        uris: addQuery,
    };

    //empty the playlist
    const flushRes = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist.playlist_id}/tracks`,
        accessToken,
        {
            uris: [],
        }
    );

    if (flushRes.error) {
        const { message, status } = flushRes.error;
        return NextResponse.json({ message }, { status });
    }

    debugLog("API: Flushed Playlist:", flushRes);

    //add the tracks to the playlist
    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${playlist.playlist_id}/tracks`,
        accessToken,
        addBody
    );

    if (addRes.error) {
        const { message, status } = addRes.error;
        return NextResponse.json({ message }, { status });
    }

    const { playlist_id, preferences, seeds, rules } = playlist;
    //update the description
    const preferencesBody = {
        name: preferences.name,
        description: createPlaylistDescription(preferences, seeds, rules),
        public: false,
    };

    const updatePlaylistDetails = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}`,
        accessToken,
        preferencesBody
    );

    if (updatePlaylistDetails.error) {
        const { message, status } = updatePlaylistDetails.error;
        console.error("Problem updating Playlist details.\n" + message, status);
    }

    //restore the cover image
    await updatePlaylistCover(preferences.hue, playlist_id, accessToken);
}

//needs to be here because of the canvas dependency leading to bundler issues if not in api route, for the same reason we load the image here
const generateCoverImage = async (hue: number): Promise<string> => {
    debugLog("API: Generating Cover Image with Hue:", hue);
    const canvas = createCanvas(640, 640);

    const dirRelativeToPublicFolder = ".";
    const dir = resolve("./public", dirRelativeToPublicFolder);
    const pathToLogo = dir + "/logo-v2.svg";
    const logo = await loadImage(pathToLogo);

    createCanvasGradient(canvas, hue, logo);
    const buffer = canvas.toDataURL("image/jpeg");
    const base64JpegData = buffer.replace(/^data:image\/\w+;base64,/, "");
    return base64JpegData;
};

const updatePlaylistCover = async (hue: number, idToWriteTo: string, accessToken: string): Promise<void> => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Playlist cover update timed out after 10s")), 10 * 60 * 1000); //10 minutes
    });

    try {
        await Promise.race([
            (async () => {
                const coverImageData = await generateCoverImage(hue);
                debugLog("API: Generated Cover Image. Sending to Spotify");
                const res = await spotifyPut(
                    `https://api.spotify.com/v1/playlists/${idToWriteTo}/images`,
                    accessToken,
                    coverImageData,
                    { "Content-Type": "image/jpeg" }
                );
                debugLog("API: Added Cover Image to Playlist:", res);
            })(),
            timeoutPromise,
        ]);
    } catch (error) {
        console.error("Failed to update playlist cover:", error);
        throw error;
    }
};
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

//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAccountByUserId, dbGetAllUsers, dbUpdatePlaylist } from "@/lib/db/dbActions";
import { refreshAccessToken, updateAccountTokenInDb } from "@/lib/auth";
import { setDebugMode, debugLog } from "@/lib/utils";
import { convertIdArraytoPlaylistVersion } from "@/lib/spotifyUtils";

export async function GET(req: NextRequest) {
    try {
        setDebugMode(true);
        debugLog("CRON: GET request received", req);

        const usersFromDb = await dbGetAllUsers();

        if (usersFromDb.error || !usersFromDb.data) {
            return NextResponse.json({ message: "failed getting userdata" }, { status: 500 });
        }

        const users = usersFromDb.data;

        for (const user of users) {
            debugLog("User: " + user.name);
            for (const playlist of user.playlists) {
                debugLog("Updating Playlist: " + playlist.preferences.name);

                const formattedTrackHistory = convertIdArraytoPlaylistVersion(
                    playlist.trackHistory,
                    playlist.preferences.amount
                );

                console.log("formattedTrackHistory for " + playlist.preferences.name, formattedTrackHistory);
                const dbSuccess = await dbUpdatePlaylist(user.spotify_id, {
                    playlist_id: playlist.playlist_id,
                    trackHistory: formattedTrackHistory,
                });
                debugLog("DB update success: ", dbSuccess);
            }
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("CRON: error in GET request", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

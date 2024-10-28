import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

import { spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { trackIdsToQuery } from "@/lib/spotifyUtils";
import { dbGetOnePlaylistData } from "@/lib/db/dbActions";
import { debugLog, setDebugMode } from "@/lib/utils";
import { sanitizeNumber, sanitizeString } from "@/lib/securityUtils";

import { getToken } from "next-auth/jwt";
import { revalidateTag } from "next/cache";

interface restoreVersionBody {
    playlist_id: string;
    version_index: number;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        setDebugMode(false);
        const rawData = (await req.json()) as restoreVersionBody;

        const validId = sanitizeString(rawData.playlist_id, "id");
        const validIndex = sanitizeNumber(rawData.version_index);

        if (!validId || !validIndex) {
            return NextResponse.json({ errors: "Something went wrong" }, { status: 400 });
        }

        //add the token to the request for the api call
        const token = await getToken({ req });
        if (!token) {
            console.error("No token found");
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const { accessToken, userId } = token;

        //get the playlist data from the database
        const playlistData = await dbGetOnePlaylistData(userId, validId);

        if (
            playlistData.error ||
            !playlistData.data ||
            !playlistData.data.trackHistory ||
            !playlistData.data.trackHistory[validIndex] ||
            !playlistData.data.trackHistory[validIndex].tracks
        ) {
            return NextResponse.json(
                {
                    message:
                        "Failed to get the playlist version: " + playlistData.error ? playlistData.error : "Not found",
                },
                { status: 500 }
            );
        }

        console.log("full data: ", playlistData);

        const playlistVersion = playlistData.data.trackHistory[validIndex].tracks;

        //turn into query string
        const addQuery = trackIdsToQuery(playlistVersion);
        const addBody = {
            uris: addQuery,
        };

        //empty the playlist
        const flushRes = await spotifyPut(`https://api.spotify.com/v1/playlists/${validId}/tracks`, accessToken, {
            uris: [],
        });

        if (flushRes.error) {
            const { message, status } = flushRes.error;
            return NextResponse.json({ message }, { status });
        }

        debugLog("API: Flushed Playlist:", flushRes);

        //add the tracks to the playlist
        const addRes = await spotifyPost(
            `https://api.spotify.com/v1/playlists/${validId}/tracks`,
            accessToken,
            addBody
        );

        if (addRes.error) {
            const { message, status } = addRes.error;
            return NextResponse.json({ message }, { status });
        }

        revalidateTag("playlists");

        return NextResponse.json({ message: "Version " + validId + 1 + " restored successfully" }, { status: 201 });
    } catch (error) {
        console.error("Failed to create Playlist", error);
        return NextResponse.json({ message: "Failed to create Playlist" }, { status: 500 });
    }
}

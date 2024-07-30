import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth, spotifyPost, spotifyPut, spotifyGet } from "@/lib/serverUtils";
import { getRecommendations, createPlaylistDescription } from "@/lib/spotifyUtils";
import { createCanvasGradient } from "@/lib/utils";
import { getToken } from "next-auth/jwt";
import { PlaylistData } from "@/types/spotify";
import { dbCreatePlaylist, dbGetUsersPlaylists, dbUpdatePlaylist } from "@/lib/db/dbActions";
import { debugLog, setDebugMode } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { createCanvas } from "@napi-rs/canvas";

const generateCoverImage = async (hue: number): Promise<string> => {
    console.log("Generating Cover Image. Hue:", hue);

    const canvas = createCanvas(640, 640);
    console.log("Canvas created");

    createCanvasGradient(canvas, hue);
    console.log("Gradient painted");

    const buffer = canvas.toDataURL("image/jpeg");
    console.log("Canvas to data URL");

    const base64JpegData = buffer.replace(/^data:image\/\w+;base64,/, "");
    console.log("Base64 data created");

    return base64JpegData;
};

const updatePlaylistCover = async (hue: number, idToWriteTo: string, accessToken: string): Promise<void> => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Playlist cover update timed out after 10s")), 10000);
    });

    try {
        await Promise.race([
            (async () => {
                const coverImageData = await generateCoverImage(hue);
                const res = await spotifyPut(
                    `https://api.spotify.com/v1/playlists/${idToWriteTo}/images`,
                    accessToken,
                    coverImageData,
                    { "Content-Type": "image/jpeg" }
                );
                console.log("API: Added Cover Image to Playlist:", res);
            })(),
            timeoutPromise,
        ]);
    } catch (error) {
        console.error("Failed to update playlist cover:", error);
        throw error;
    }
};

export async function POST(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);

    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST POST - creating new playlist " + preferences.name);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { accessToken, userId } = token;

    //complete the request body with the description and public fields
    const createBody = {
        name: preferences.name,
        description: createPlaylistDescription(preferences, seeds, rules),
        public: false,
    };

    //make the api call to create the playlist and save the id for the created playlist
    debugLog(" - creating the playlist");

    const validatePlaylist = (data: any) => {
        if (!data.id || typeof data.id !== "string") {
            return { valid: false, message: "Spotify didn't accept creation", status: 500 };
        }
        return { valid: true };
    };

    const newPlaylistRes = await spotifyPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        accessToken,
        createBody,
        validatePlaylist
    );
    if (newPlaylistRes.error) {
        const { message, status } = newPlaylistRes.error;
        return NextResponse.json({ message: "Failed to create Playlist.\n" + message }, { status });
    }

    const { id: idToWriteTo } = newPlaylistRes;
    debugLog(" - created playlist with id: " + idToWriteTo);

    //get the recommendations and add them to the body for the api call that adds the tracks to the playlist
    const recommandationUris = await getRecommendations(accessToken, preferences, seeds, rules);

    if ("error" in recommandationUris) {
        const { message, status } = recommandationUris.error;
        return NextResponse.json(
            { message: "Failed to get Recommendations.\n Maybe your Settings are very limiting.\n" + message },
            { status }
        );
    }
    //add the tracks to the playlist

    const addBody = {
        uris: recommandationUris,
    };

    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${idToWriteTo}/tracks`,
        accessToken,
        addBody
    );

    if (addRes.error) {
        const { message, status } = addRes.error;
        return NextResponse.json({ message }, { status });
    }

    debugLog("API: Added Tracks to Playlist:", addRes);

    //add the cover image to the playlist
    const hue = preferences.hue || Math.floor(Math.random() * 360);
    delete preferences.hue;
    await updatePlaylistCover(hue, idToWriteTo, accessToken).catch((error) => {
        console.error("Failed to update Cover Image", error);
    });

    //add playlist to user document DB
    const dbSuccess = await dbCreatePlaylist(userId, {
        playlist_id: idToWriteTo,
        preferences,
        seeds,
        rules,
    });

    if (!dbSuccess) {
        return NextResponse.json(
            {
                message: "Created successfully on Spotify but failed to save to database",
            },
            { status: 500 }
        );
    }
    revalidateTag("playlists");
    return NextResponse.json(idToWriteTo, { status: 201 });
}

//TODO: check if playlist exists in spotify (could be deleted by user) -> if there is no playlist id mathing the one in db call post
export async function PUT(req: NextRequest): Promise<NextResponse> {
    setDebugMode(true);

    const data = await req.json();
    if (!data.playlist_id) {
        return NextResponse.json({ message: "No Playlist ID provided" }, { status: 400 });
    }

    const { playlist_id, preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST PUT - updating playlist " + preferences.name);

    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { accessToken, userId } = token;

    //check if the playlist exists, could be deleted by user (spotify handles deleting by unfollowing)
    const exists = await spotifyGet(
        `https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains`,
        accessToken
    );
    //if the playlist does not exist, follow the old one again
    if (!exists[0]) {
        const followRes = await spotifyPut(
            `https://api.spotify.com/v1/playlists/${playlist_id}/followers`,
            accessToken,
            { public: false }
        );
        if (followRes.error) {
            const { status } = followRes.error;
            return NextResponse.json({ message: "Seems like the Playlist doesn't exist anymore\n" }, { status });
        }
    }

    debugLog(" - checking if playlist exists", exists);
    //complete the request body with the description and public fields
    const preferencesBody = {
        name: preferences.name,
        description: createPlaylistDescription(preferences, seeds, rules),
        public: false,
    };

    const updatePlaylistDetails = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}`,
        accessToken,
        preferencesBody,
        undefined,
        undefined,
        true
    );

    if (updatePlaylistDetails.error) {
        const { message, status } = updatePlaylistDetails.error;
        return NextResponse.json({ message: "Problem updating Playlist details.\n" + message }, { status });
    }

    //flush the playlist
    debugLog(" - flushing the playlist");
    const flushRes = await spotifyPut(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, accessToken, {
        uris: [],
    });

    if (flushRes.error) {
        const { message, status } = flushRes.error;
        return NextResponse.json({ message: "Failed deleting old Tracks.\n" + message }, { status });
    }

    const recommandationUris = await getRecommendations(accessToken, preferences, seeds, rules);
    debugLog(" - got recommendations", recommandationUris);

    if ("error" in recommandationUris) {
        console.error("Failed to get Recommendations!!!!", recommandationUris.error);
        const { message, status } = recommandationUris.error;
        return NextResponse.json(
            {
                message: "Failed to get Recommendations. Maybe your Settings are very limiting.\n" + message,
            },
            { status }
        );
    }
    //add the tracks to the playlist

    const addBody = {
        uris: recommandationUris,
    };

    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        accessToken,
        addBody,
        undefined,
        true
    );

    if (addRes.error) {
        const { message, status } = addRes.error;
        return NextResponse.json({ message: "Failed adding new Tracks.\n" + message }, { status });
    }

    if (preferences.hue) {
        await updatePlaylistCover(preferences.hue, playlist_id, accessToken).catch((error) => {
            console.error("Failed to update Cover Image", error);
        });
    }

    const dbSuccess = await dbUpdatePlaylist(userId, {
        playlist_id,
        preferences,
        seeds,
        rules,
    });

    if (!dbSuccess) {
        return NextResponse.json(
            {
                message: "Updated successfully on Spotify but failed to save changes to database.",
            },
            { status: 500 }
        );
    }

    revalidateTag("playlists");
    return NextResponse.json(playlist_id, { status: 201 });
}

/**
 * Get all playlists for the user
 * @param req
 * @returns {Promise<NextResponse>} all the playlists for the user
 */

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);
    debugLog("API: PLAYLIST GET - fetching playlists for user");
    const session = await auth("PLAYLIST ENDPOINT");
    debugLog("API: got session", session);

    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const userId = session.user.id;

    const { playlists, error } = await dbGetUsersPlaylists(userId);
    debugLog("API: PLAYLIST GET - fetching playlists for user", userId, playlists, error);
    if (error) {
        return NextResponse.json(
            {
                message: "An error occurred while fetching the playlists.",
                error: error,
            },
            { status: 500 }
        );
    }

    return NextResponse.json(playlists, { status: 200 });
}

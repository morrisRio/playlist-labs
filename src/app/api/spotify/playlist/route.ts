import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth, spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { getRecommendations, createPlaylistDescription } from "@/lib/spotifyUtils";
import { getToken } from "next-auth/jwt";
import { PlaylistData } from "@/types/spotify";
import { dbCreatePlaylist, dbGetUsersPlaylists, dbUpdatePlaylist } from "@/lib/db/dbActions";
import { debugLog, setDebugMode } from "@/lib/logger";

import { revalidateTag } from "next/cache";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(false);

    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST POST - creating new playlist " + preferences.name);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
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
    //@ts-ignore
    const { id: idToWriteTo } = await spotifyPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        createBody,
        accessToken
    );
    debugLog(" - created playlist with id: " + idToWriteTo);

    //get the recommendations and add them to the body for the api call that adds the tracks to the playlist
    const addBody = {
        uris: await getRecommendations(accessToken, preferences, seeds, rules),
    };
    //add the tracks to the playlist
    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${idToWriteTo}/tracks`,
        addBody,
        accessToken
    );

    debugLog("API: Added Tracks to Playlist:", addRes);

    //delete the hasChanged field from the preferences
    delete preferences.hasChanged;

    //add playlist to user document DB
    const dbSuccess = await dbCreatePlaylist(userId, {
        playlist_id: idToWriteTo,
        preferences,
        seeds,
        rules,
    });
    revalidateTag("playlists");

    if (!dbSuccess) {
        return new NextResponse(
            JSON.stringify({
                message: "Playlist created on Spotify, but an error occurred while saving to the database.",
                error: "Database save error",
            }),
            { status: 500 }
        );
    }

    /* const url = req.nextUrl.clone();
    url.pathname = `/edit-playlist/${idToWriteTo}`;
    return NextResponse.redirect(url); */

    //TODO: CACHING - revalidate cache for home to show the new playlist
    // 1. api/spotify/playlist/route.ts/GET -> serverfucntion playlist
    // 2. fetch this endpoint and set the revalidate tags to playlists
    // 3. revalidate the playlists tag
    //revalidate cache for home to show the new playlist
    // revalidatePath("/");
    return NextResponse.json(idToWriteTo, { status: 201 });
}

//TODO: check if playlist exists in spotify (could be deleted by user) -> if there is no playlist id mathing the one in db call post
export async function PUT(req: NextRequest): Promise<NextResponse> {
    setDebugMode(false);

    const data = await req.json();
    const { playlist_id, preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST PUT - updating playlist " + preferences.name);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const { accessToken, userId } = token;

    //complete the request body with the description and public fields
    const preferencesBody = {
        name: preferences.name,
        description: createPlaylistDescription(preferences, seeds, rules),
        public: false,
    };

    const updatePlaylistDetails = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}`,
        preferencesBody,
        accessToken
    );

    //flush the playlist
    debugLog(" - flushing the playlist");
    const flushRes = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        { uris: [] },
        accessToken
    );
    // debugLog(" - FLUSHED PLAYLIST: flushRes:" + flushRes);

    const addBody = {
        uris: await getRecommendations(accessToken, preferences, seeds, rules),
    };

    //add the new tracks to the playlist
    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        addBody,
        accessToken
    );

    // debugLog("API: Added Tracks to Playlist:", addRes);

    const dbSuccess = await dbUpdatePlaylist(userId, {
        playlist_id,
        preferences,
        seeds,
        rules,
    });
    revalidateTag("playlists");

    if (!dbSuccess) {
        return new NextResponse(
            JSON.stringify({
                message: "Playlist updated on Spotify, but an error occurred while saving changes to the database.",
                error: "Database save error",
            }),
            { status: 500 }
        );
    }

    //TODO: CACHING - revalidate cache for home to show the new playlist
    // 1. api/spotify/playlist/route.ts/GET -> serverfucntion playlist
    // 2. fetch this endpoint and set the revalidate tags to playlists
    // 3. revalidate the playlists tag
    //revalidate cache for home to show the new playlist
    // revalidatePath("/");

    return NextResponse.json(playlist_id, { status: 201 });
}

/**
 * Get all playlists for the user
 * @param req
 * @returns {Promise<NextResponse>} all the playlists for the user
 */

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);

    const session = await getServerSession(authOptions);
    debugLog("got session", session);

    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    const { playlists, error } = await dbGetUsersPlaylists(userId);
    debugLog("API: PLAYLIST GET - fetching playlists for user", userId, playlists, error);
    if (error) {
        return new NextResponse(
            JSON.stringify({
                message: "An error occurred while fetching the playlists.",
                error: error,
            }),
            { status: 500 }
        );
    }

    return NextResponse.json(playlists, { status: 200 });
}

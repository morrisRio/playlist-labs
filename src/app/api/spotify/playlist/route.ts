import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { getRecommendations, createPlaylistDescription } from "@/lib/spotifyUtils";
import { getToken } from "next-auth/jwt";
import { PlaylistData, Preferences, Seed, Rule } from "@/types/spotify";
import { dbCreatePlaylist, dbUpdatePlaylist } from "@/lib/db/dbActions";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistData = data;

    console.log("API: PLAYLIST POST - creating new playlist " + preferences.name);
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
    console.log(" - creating the playlist");
    //@ts-ignore
    const { id: idToWriteTo } = await spotifyPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        createBody,
        accessToken
    );
    console.log(" - created playlist with id: " + idToWriteTo);

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

    console.log("API: Added Tracks to Playlist:", addRes);

    //delete the hasChanged field from the preferences
    delete preferences.hasChanged;

    //add playlist to user document DB
    const dbSuccess = await dbCreatePlaylist(userId, {
        playlist_id: idToWriteTo,
        preferences,
        seeds,
        rules,
    });

    if (!dbSuccess) {
        return new NextResponse(
            JSON.stringify({
                message: "Playlist created on Spotify, but an error occurred while saving to the database.",
                error: "Database save error",
            }),
            { status: 500 }
        );
    }
    //revalidate cache for home to show the new playlist
    revalidatePath("/");

    return NextResponse.json(idToWriteTo, { status: 201 });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    const data = await req.json();
    const { playlist_id, preferences, seeds, rules }: PlaylistData = data;

    console.log("API: PLAYLIST PUT - updating playlist " + preferences.name);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const { accessToken, userId } = token;

    //complete the request body with the description and public fields

    //Change Description and Name of the Playlist
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
    console.log(" - flushing the playlist");
    const flushRes = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        { uris: [] },
        accessToken
    );
    // console.log(" - FLUSHED PLAYLIST: flushRes:" + flushRes);

    const addBody = {
        uris: await getRecommendations(accessToken, preferences, seeds, rules),
    };

    //add the new tracks to the playlist
    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        addBody,
        accessToken
    );

    // console.log("API: Added Tracks to Playlist:", addRes);

    const dbSuccess = await dbUpdatePlaylist(userId, {
        playlist_id,
        preferences,
        seeds,
        rules,
    });

    if (!dbSuccess) {
        return new NextResponse(
            JSON.stringify({
                message: "Playlist updated on Spotify, but an error occurred while saving changes to the database.",
                error: "Database save error",
            }),
            { status: 500 }
        );
    }

    //revalidate cache for home to show the new playlist
    revalidatePath("/");

    return NextResponse.json(playlist_id, { status: 201 });
}

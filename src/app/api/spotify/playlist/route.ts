import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customPost, customPut } from "@/lib/serverUtils";
import { getRecommendations } from "@/lib/spotifyActions";
import { getToken } from "next-auth/jwt";
import { PlaylistData } from "@/types/spotify";

//TODO: differentiate between creating a playlist and updating a playlist

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistData = data;

    console.log(
        "API: PLAYLIST POST - creating new playlist " + preferences.name
    );
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }
    const accessToken = token?.accessToken || "no token found";
    const userId = token?.userId || "no username found";

    //complete the request body with the description and public fields
    const createBody = {
        name: preferences.name,
        description: "Playlist created by playlistLabs",
        public: false,
    };

    //make the api call to create the playlist and save the id for the created playlist
    console.log(" - creating the playlist");
    const { id: idToWriteTo } = await customPost(
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
    const addRes = await customPost(
        `https://api.spotify.com/v1/playlists/${idToWriteTo}/tracks`,
        addBody,
        accessToken
    );

    console.log("API: Added Tracks to Playlist:", addRes);

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

    const accessToken = token?.accessToken || "no token found";
    const userId = token?.userId || "no username found";

    //Change Description and Name of the Playlist
    //complete the request body with the description and public fields
    const preferencesBody = {
        name: preferences.name,
        description: "Playlist created by playlistLabs",
        public: false,
    };

    //flush the playlist
    console.log(" - flushing the playlist");
    const flushRes = await customPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        { uris: [] },
        accessToken
    );
    console.log(" - FLUSHED PLAYLIST: flushRes:" + flushRes);

    const addBody = {
        uris: await getRecommendations(accessToken, preferences, seeds, rules),
    };

    //add the new tracks to the playlist
    const addRes = await customPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        addBody,
        accessToken
    );

    console.log("API: Added Tracks to Playlist:", addRes);

    return NextResponse.json(playlist_id, { status: 201 });
}

interface Owner {
    href: string;
    id: string;
    type: string;
    uri: string;
    display_name: string | null;
    external_urls: {
        spotify: string;
    };
}

interface ExternalUrls {
    spotify: string;
}

interface Followers {
    href: string | null;
    total: number;
}

interface Tracks {
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    href: string;
    total: number;
    items: any[]; // You might want to create a type for track items
}

interface PlaylistResponse {
    collaborative: boolean;
    description: string;
    external_urls: ExternalUrls;
    followers: Followers;
    href: string;
    id: string;
    images: string[]; // You might want to create a type for image URLs
    primary_color: string | null;
    name: string;
    type: string;
    uri: string;
    owner: Owner;
    public: boolean;
    snapshot_id: string;
    tracks: Tracks;
}

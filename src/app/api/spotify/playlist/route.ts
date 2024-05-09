import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customGet, customPost } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { Seed, Rule, Preferences, Track } from "@/types/spotify";

interface PlaylistSettings {
    preferences: Preferences;
    seeds: Seed[];
    rules: Rule[];
}

//TODO: differentiate between creating a playlist and updating a playlist

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistSettings = data;

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
    //make the api call to create the playlist
    const res = await customPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        createBody,
        accessToken
    );
    // get the playlist id from the response
    const playlist_id = res.id;

    //create the query string for the api call from the seeds and rules

    const limitQuery = "limit=" + preferences.amount;
    const seedQuery = getSeedQuery(seeds);
    const ruleQuery = getRuleQuery(rules);

    //add tracks to the playlist
    const trackRes: TracksResponse = await customGet(
        `https://api.spotify.com/v1/recommendations?${limitQuery}&${seedQuery}&${ruleQuery}`,
        accessToken
    );
    //create the tracksquery
    const tracksToAdd = trackRes.tracks.map(
        (track) => `spotify:track:${track.id}`
    );

    const addBody = {
        uris: tracksToAdd,
    };

    const addRes = await customPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        addBody,
        accessToken
    );

    console.log("addRes:", addRes);

    return NextResponse.json(playlist_id, { status: 201 });
}

const getRuleQuery = (rules: Rule[]) => {
    const ruleQuery = rules
        .map((rule) => {
            if (Array.isArray(rule.value)) {
                //this might be flipped
                return `target_valence=${
                    1 - rule.value[1] / 100
                }&target_energy=${rule.value[0] / 100}`;
            } else if (
                rule.type === "range" &&
                typeof rule.value === "number"
            ) {
                return `target_${rule.name}=${rule.value / 100}`;
            } else if (
                rule.type === "boolean" &&
                typeof rule.value === "boolean"
            ) {
                return `target_${rule.name}=${rule.value}`;
            }
        })
        .join("&");
    console.log("ruleQuery:", ruleQuery);
    return ruleQuery;
};

const getSeedQuery = (seeds: Seed[]) => {
    const seedArtists = seeds.filter((seed) => seed.type === "artist");
    const seedGenres = seeds.filter((seed) => seed.type === "genre");
    const seedTracks = seeds.filter((seed) => seed.type === "track");

    const seedArtistsQuery =
        seedArtists.length > 0
            ? "seed_artists=" + seedArtists.map((seed) => seed.id).join(",")
            : "";
    const seedGenresQuery =
        seedGenres.length > 0
            ? "seed_genres=" + seedGenres.map((seed) => seed.id).join(",")
            : "";
    const seedTracksQuery =
        seedTracks.length > 0
            ? "seed_tracks=" + seedTracks.map((seed) => seed.id).join(",")
            : "";

    const seedQuery = [seedArtistsQuery, seedGenresQuery, seedTracksQuery]
        .filter((seed) => seed !== "")
        .join("&");
    return seedQuery;
};

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

type TracksResponse = {
    tracks: Track[];
    seeds: Seed[];
};

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

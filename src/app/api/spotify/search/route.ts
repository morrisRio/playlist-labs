import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";

import { distance } from "fastest-levenshtein";
import { spotifyGet } from "@/lib/serverUtils";
import { getSeedsFromItems } from "@/lib/spotifyUtils";
import { debugLog, setDebugMode } from "@/lib/utils";

import { allGenresSeeds } from "@/lib/spotifyConstants";

import { Track, Artist, Seed } from "@/types/spotify";
interface SearchResults {
    artists: { items: Artist[] };
    tracks: { items: Track[] };
}

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        setDebugMode(false);

        const q = req.nextUrl.searchParams.get("q");

        //add the token to the request for the api call
        const token = await getToken({ req });
        if (!token || !token.accessToken) {
            console.error("API: SEARCH GET - No token found");
            return new NextResponse("No token found", { status: 401 });
        }

        const accessToken = token.accessToken;

        debugLog("API: SEARCH GET - Getting search results for", q);

        let genreSeeds: Seed[] = [];
        if (q) {
            genreSeeds = allGenresSeeds.filter((genre) => {
                return distance(genre.title.substring(0, q.length), q) < 2;
            });
        }

        // make the api call to search for tracks and artists
        const data = (await spotifyGet(
            `https://api.spotify.com/v1/search?q=${q}&type=track%2Cartist&limit=25&offset=0`,
            accessToken
        )) as unknown as SearchResults;

        const { artists, tracks } = data;

        const artistSeeds: Seed[] = getSeedsFromItems(artists.items);
        const trackSeeds: Seed[] = getSeedsFromItems(tracks.items);

        debugLog("GOT" + artistSeeds.length + trackSeeds.length + "ITEMS");

        //sort them with the lehvenstein distance algorithm according to the search query
        const results = [...genreSeeds, ...trackSeeds, ...artistSeeds];

        const resultsRanked = results.map((item: any) => {
            return {
                ...item,
                distance: distance(item.title, q ? q : ""),
            };
        });

        if (q) {
            debugLog("SORTING...");
            let i = 0;
            resultsRanked.sort((a, b) => {
                debugLog("sorting...", i);
                i++;
                return a.distance - b.distance;
            });
        }

        debugLog("SORTING DONE, returning");

        return NextResponse.json(resultsRanked);
    } catch (error) {
        console.error("Failed to update playlist cover:", error);
        return NextResponse.json({ message: "Failed to get search results" }, { status: 500 });
    }
}

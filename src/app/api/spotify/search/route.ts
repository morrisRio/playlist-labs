import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { getSeedsFromItems } from "@/lib/spotifyActions";
import { allGenresSeeds } from "@/lib/spotifyConstants";
import { Seed } from "@/types/spotify";
import { Track, Artist } from "@/types/spotify";
import { distance } from "fastest-levenshtein";
import { debugLog, setDebugMode } from "@/lib/logger";

interface SearchResults {
    artists: { items: Artist[] };
    tracks: { items: Track[] };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    const q = req.nextUrl.searchParams.get("q");
    setDebugMode(false);

    debugLog("GETTING TOKEN");

    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";

    let genreSeeds: Seed[] = [];
    if (q) {
        genreSeeds = allGenresSeeds.filter((genre) => {
            return distance(genre.title.substring(0, q.length), q) < 2;
        });
    }

    debugLog("GETTING THE ITEMS");

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

    // TODO: OPRIMIZING remember to check for timeout
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
}

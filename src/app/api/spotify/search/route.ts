import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { getSeedsFromItems, genres } from "@/lib/spotifyActions";
import { Seed } from "@/types/spotify";
import { Track, Artist } from "@/types/spotify";
import { distance } from "fastest-levenshtein";

interface SearchResults {
    artists: { items: Artist[] };
    tracks: { items: Track[] };
}

export async function GET(
    req: NextRequest,
    { params }: { params: { q: string } }
): Promise<NextResponse> {
    const q = req.nextUrl.searchParams.get("q");

    console.log("GETTING TOKEN");
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";

    let foundGenres: string[] = [];

    //TODO: this sometimes takes ages and crashes
    //DO THIS FIRST THEN FILTER OUT
    // mostly with a long search query
    console.log("SEARCHING GENRES");
    if (q) {
        foundGenres = genres.filter((genre) => {
            return distance(genre.substring(0, q.length), q) < 2;
        });
    }
    console.log("FORMATTING GENRES");
    const foundGenreItems = foundGenres.map((genre) => {
        const genreItem = {
            title: genre,
            type: "genre",
        };
        return genreItem;
    });

    const genreSeeds: Seed[] = getSeedsFromItems(foundGenreItems);

    console.log("FOUND GENRES", genreSeeds);
    console.log("GETTING THE ITEMS");

    // make the api call to search for tracks and artists
    const data = (await customGet(
        `https://api.spotify.com/v1/search?q=${q}&type=track%2Cartist&limit=25&offset=0`,
        accessToken
    )) as unknown as SearchResults;

    //@ts-ignore

    const { artists, tracks } = data;
    // console.log(artists);
    const artistSeeds: Seed[] = getSeedsFromItems(artists.items);
    const trackSeeds: Seed[] = getSeedsFromItems(tracks.items);
    console.log("GOT" + artistSeeds.length + trackSeeds.length + "ITEMS");
    //sort them with the lehvenstein distance algorithm according to the search query
    const results = [...genreSeeds, ...artistSeeds, ...trackSeeds];

    // TODO: remember to check for timeout
    const resultsRanked = results.map((item: any) => {
        return {
            ...item,
            distance: distance(item.title, q ? q : ""),
        };
    });

    //this seems to crash/ take huge amount of time
    if (q) {
        console.log("SORTING...");
        let i = 0;
        resultsRanked.sort((a, b) => {
            console.log("sorting...", i);
            i++;
            return a.distance - b.distance;
        });
    }

    console.log("SORTING DONE, returning");

    // console.log("sorted: ", results);
    //results.sort(function(a, b) {
    //     return a.score - b.score;
    // });

    return NextResponse.json(resultsRanked);
}

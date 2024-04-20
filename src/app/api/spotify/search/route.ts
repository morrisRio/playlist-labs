import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { getSeedsFromItems, genres } from "@/lib/spotifyActions";
import { Seed } from "@/types/spotify";
import { Track, Artist } from "@/types/spotify";
import { levenshteinDistance } from "@/lib/mathUtils";

interface SearchResults {
    artists: { items: Artist[] };
    tracks: { items: Track[] };
}

export async function GET(
    req: NextRequest,
    { params }: { params: { q: string } }
): Promise<NextResponse> {
    const q = req.nextUrl.searchParams.get("q");

    console.log("GETTING SEARCH ITEMS: ", q);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";

    let foundGenres: string[] = [];

    if (q) {
        foundGenres = genres.filter((genre) => {
            return levenshteinDistance(genre.substring(0, q.length), q) < 3;
        });
    }

    const foundGenreItems = foundGenres.map((genre) => {
        const genreItem = {
            title: genre,
            type: "genre",
        };
        return genreItem;
    });

    const genreSeeds: Seed[] = getSeedsFromItems(foundGenreItems);

    console.log("FOUND GENRES", genreSeeds);

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

    //sort them with the lehvenstein distance algorithm according to the search query
    const results = [...genreSeeds, ...artistSeeds, ...trackSeeds];
    console.log("got Seeds: ", results);

    //this seems to crash/ take huge amount of time
    // TODO: remember to check for timeout
    if (q) {
        console.log("SORTING...");
        let i = 0;
        results.sort((a, b) => {
            console.log("sorting...", i);
            i++;
            return (
                levenshteinDistance(
                    a.title.toLowerCase().substring(0, q.length),
                    q.toLowerCase()
                ) -
                levenshteinDistance(
                    b.title.toLowerCase().substring(0, q.length),
                    q.toLowerCase()
                )
            );
        });
    }

    console.log("sorting done");

    // console.log("sorted: ", results);
    //results.sort(function(a, b) {
    //     return a.score - b.score;
    // });

    return NextResponse.json(results);
}

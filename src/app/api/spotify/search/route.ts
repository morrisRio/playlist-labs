import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { getSeedsFromItems } from "@/lib/spotifyActions";
import { Seed } from "@/types/spotify";
import { Track, Artist } from "@/types/spotify";
import { get } from "http";

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

    // make the api call to search for tracks and artists
    const data = (await customGet(
        `https://api.spotify.com/v1/search?q=${q}&type=track%2Cartist&limit=25&offset=0`,
        accessToken
    )) as unknown as SearchResults;

    //@ts-ignore

    const { artists, tracks } = data;

    const artistSeeds: Seed[] = getSeedsFromItems(artists.items);
    const trackSeeds: Seed[] = getSeedsFromItems(tracks.items);

    //do this for tracks as well
    //then make one big array of all the seeds plus genres
    //sort them with the lehvenstein distance algorithm according to the search query

    // console.log("found: ", artistSeeds);

    return NextResponse.json({ artistSeeds });
}

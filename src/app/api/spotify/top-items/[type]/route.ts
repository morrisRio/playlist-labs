import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "@/lib/logger";

export async function GET(req: NextRequest, { params }: { params: { type: string } }): Promise<NextResponse> {
    setDebugMode(false);
    const type = params.type;
    const time_range = req.nextUrl.searchParams.get("time_range");

    debugLog("GETTING TOP ITEMS: ", type, time_range);
    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";

    // make the api call to get top items
    const data = await spotifyGet(`https://api.spotify.com/v1/me/top/${type}/?time_range=${time_range}`, accessToken);
    //@ts-ignore
    debugLog("received data: ", data.items?.length + " items");

    return NextResponse.json({ data });
}

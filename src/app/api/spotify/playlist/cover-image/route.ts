import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "@/lib/logger";

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(false);

    const token = await getToken({ req });
    debugLog("got token", token);

    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const { accessToken } = token;
    const playlistId = req.nextUrl.searchParams.get("playlist_id");

    const image = await spotifyGet(`https://api.spotify.com/v1/playlists/${playlistId}/images`, accessToken);
    // TODO: spotify get error handling
    // if (image.status !== 200) return new NextResponse.json("No image found", { status: 404 });

    return NextResponse.json(image[1], { status: 200 });
}

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyGet, spotifyPut } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "@/lib/utils";

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);
    const token = await getToken({ req });
    debugLog("GETTING THE PLAYLIST COVER IMAGE ======================");
    debugLog("GET - token", token);
    if (!token) {
        console.error("No token found");
        debugLog("END OF GET ======================");
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    debugLog("got token", token.accessToken);

    const { accessToken } = token;
    const playlistId = req.nextUrl.searchParams.get("playlist_id");
    debugLog("getting image for playlist", playlistId);

    const validatePlaylistImage = (data: any) => {
        if (!data || !data[0] || !data[0].url || typeof data[0].url !== "string") {
            return { valid: false, message: "No image found", status: 412 };
        }
        return { valid: true };
    };

    const imageResponseData = await spotifyGet(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        accessToken,
        validatePlaylistImage,
        false // Enable debug mode
    );

    if (imageResponseData.error) {
        debugLog("API - error", imageResponseData.error);
        debugLog("END OF GET ======================");
        const { message, status } = imageResponseData.error;
        return NextResponse.json({ message }, { status });
    }

    const { url } = imageResponseData[0];
    debugLog("API - after fetch", url);
    debugLog("END OF GET ======================");
    return NextResponse.json(url, { status: 200 });
}

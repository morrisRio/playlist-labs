import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "@/lib/logger";
import { debug } from "console";

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);

    const token = await getToken({ req });

    if (!token) {
        console.error("No token found");
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    debugLog("got token", token.accessToken);

    const { accessToken } = token;
    const playlistId = req.nextUrl.searchParams.get("playlist_id");

    const validatePlaylistImage = (data: any) => {
        if (!data || !data[1] || !data[1].url || typeof data[1].url !== "string") {
            return { valid: false, message: "No image found", status: 404 };
        }
        return { valid: true };
    };

    const imageResponseData = await spotifyGet(
        `https://api.spotify.com/v1/playlists/${playlistId}/images`,
        accessToken,
        validatePlaylistImage,
        true // Enable debug mode
    );

    if (imageResponseData.error) {
        debugLog("API - error", imageResponseData.error);
        const { message, status } = imageResponseData.error;
        return NextResponse.json({ message }, { status });
    }

    const { url } = imageResponseData[1];
    debugLog("API - after fetch", imageResponseData);
    return NextResponse.json(url, { status: 200 });
}

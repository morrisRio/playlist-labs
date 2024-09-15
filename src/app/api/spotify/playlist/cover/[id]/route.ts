import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { debugLog, setDebugMode } from "@/lib/utils";
import { getToken } from "next-auth/jwt";

export async function GET(
    req: NextRequest,
    {
        params,
    }: {
        params: { id: string };
    }
): Promise<NextResponse> {
    setDebugMode(true);
    debugLog("API: GETTING THE PLAYLIST COVER IMAGE -----------------------");
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        debugLog("API: END OF GET-----------------------");
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }
    debugLog("API: GET - token from req:", token?.accessToken);

    const { accessToken } = token;
    const playlistId = params.id;

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
        debugLog("API: END OF GET -----------------------");
        const { message, status } = imageResponseData.error;
        return NextResponse.json({ message }, { status });
    }

    const { url } = imageResponseData[0];
    debugLog("API: SUCCESS", url);
    debugLog("API: END OF GET -----------------------");
    return NextResponse.json(url, { status: 200 });
}

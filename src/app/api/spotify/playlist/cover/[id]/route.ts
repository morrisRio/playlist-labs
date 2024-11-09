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
    try {
        setDebugMode(false);

        debugLog("API: GETTING THE PLAYLIST COVER IMAGE");
        const token = await getToken({ req });
        if (!token) {
            console.error("API: GET IMAGE - No token found");
            return NextResponse.json({ error: "No token found" }, { status: 401 });
        }

        const { accessToken } = token;
        debugLog("API: GET IMAGE - Token from request:", accessToken);

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
            false
        );

        if (imageResponseData.error) {
            debugLog("API: GET IMAGE - Error:", imageResponseData.error);
            const { message, status } = imageResponseData.error;
            return NextResponse.json({ message }, { status });
        }

        const { url } = imageResponseData[0];
        debugLog("API: GET IMAGE - SUCCESS", url);

        return NextResponse.json(url, { status: 200 });
    } catch (error: any) {
        console.error("Failed to get Playlist Cover Image", error);
        return NextResponse.json({ message: "Failed to get Playlist Cover Image" }, { status: 500 });
    }
}

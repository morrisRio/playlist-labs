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
    setDebugMode(false);

    debugLog("API: GETTING THE PLAYLIST COVER IMAGE");
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        debugLog("API: END OF GET-----------------------");
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    const { accessToken } = token;
    debugLog("API: GET - TOKEN FROM REQ:", accessToken);

    //This is the debug routine for testing the error handling
    // if (accessToken === "error4")
    //     return NextResponse.json("https://upload.wikimedia.org/wikipedia/commons/1/1f/SMirC-thumbsup.svg", {
    //         status: 200,
    //     });
    // return NextResponse.json({ error: "Wrong Token: " + accessToken }, { status: 401 });

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

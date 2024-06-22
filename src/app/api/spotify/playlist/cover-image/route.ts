import { put } from "./../../../../../../node_modules/@jridgewell/set-array/src/set-array";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyGet, spotifyPut } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "@/lib/utils";
import { createCanvas } from "@napi-rs/canvas";
import { createCanvasGradient } from "@/lib/spotifyUtils";
import { writeFileSync } from "fs";
import { debug } from "console";

export async function GET(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(false);
    const token = await getToken({ req });

    if (!token) {
        console.error("No token found");
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
        const { message, status } = imageResponseData.error;
        return NextResponse.json({ message }, { status });
    }

    const { url } = imageResponseData[0];
    debugLog("API - after fetch", url);
    return NextResponse.json(url, { status: 200 });
}

export async function POST(req: NextRequest, res: NextResponse): Promise<NextResponse> {
    setDebugMode(true);

    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return NextResponse.json({ error: "No token found" }, { status: 401 });
    }
    const { accessToken } = token;

    const body = await req.json();
    if (!body.hue) return NextResponse.json({ error: "No hue provided" }, { status: 400 });

    const { hue } = body;
    debugLog("hue", hue);

    const canvas = createCanvas(640, 640);
    createCanvasGradient(canvas, hue);
    const buffer = canvas.toDataURL("image/jpeg");
    const base64JpegData = buffer.replace(/^data:image\/\w+;base64,/, "");

    const putData = await spotifyPut(
        "https://api.spotify.com/v1/playlists/0cR8yG1lBbovFlunojhGXF/images",
        accessToken,
        base64JpegData,
        { "Content-Type": "image/jpeg" }
    );
    debugLog("API - after fetch", putData);

    return NextResponse.json({ message: "success" }, { status: 200 });
}

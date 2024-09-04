import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { debugLog, setDebugMode } from "@/lib/utils";
import { dbGetOnePlaylistData } from "@/lib/db/dbActions";
import { getToken } from "next-auth/jwt";
import { ensureNewTracks, getRecommendations } from "@/lib/spotifyUtils";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        setDebugMode(false);

        const reqData = await req.json();
        const { playlistId } = reqData;

        const token = await getToken({ req });
        if (!token) {
            console.error("No token found");
            return new NextResponse("No token found", { status: 401 });
        }
        const { userId, accessToken } = token;

        console.log("API: GETTING PLAYLIST: ", playlistId);
        console.log("API: USER ID: ", userId);

        debugLog("GETTING PLAYLIST: ", playlistId);
        // get playlist data
        const { data, error } = await dbGetOnePlaylistData(userId, playlistId);
        if (!data) throw new Error("no playlist data");
        const { preferences, seeds, rules } = data;
        const recommandationIds = await getRecommendations(accessToken, preferences, seeds, rules);
        if ("error" in recommandationIds) {
            const { message, status } = recommandationIds.error;
            return NextResponse.json(
                { message: "Failed to get Recommendations.\n Maybe your Settings are very limiting.\n" + message },
                { status }
            );
        }
        const tracksToAdd = await ensureNewTracks(accessToken, userId, recommandationIds, data);
        if (error) throw new Error("DB ERROR");
        debugLog("received data: ", data);

        return NextResponse.json({ message: "playlist" }, { status: 200 });
    } catch (error) {
        console.error("Failed to get playlist:", error);
        return NextResponse.json({ message: "Failed to get playlist" }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { customPost } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";
import { log } from "console";

export async function POST(req: NextRequest): Promise<NextResponse> {
    const data = await req.json();
    console.log("data:", data);

    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";
    const userId = token?.userId || "no username found";
    //complete the request body with the description and public fields
    const body = {
        ...data,
        description: "description",
        public: false,
    };
    //make the api call to create the playlist
    const res = await customPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        body,
        accessToken
    );

    return res;
}

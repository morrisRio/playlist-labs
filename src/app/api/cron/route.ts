//get every playlist and update it if needed‚
import { NextResponse, NextRequest } from "next/server";
import { dbGetAllPlaylists } from "@/lib/db/dbActions";

export async function GET(req: NextRequest) {
    const playlists = await dbGetAllPlaylists();
    console.log(playlists);

    return NextResponse.json({ data: playlists, message: "Hello World" });
}

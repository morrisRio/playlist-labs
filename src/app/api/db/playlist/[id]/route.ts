import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import UserModel from "@/models/userModel";
import { connectMongoDB } from "@/lib/db/dbConnect";

/* POST: Create a new playlist in users document*/
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const debug = true;
    const token = await getToken({ req });
    const playlist_id = params.id;

    //TODO: add authorization to the request

    const user_id = token?.userId;

    console.log("trying connectMongoDB");
    await connectMongoDB();

    const { preferences, seeds, rules } = await req.json();

    const playlistToAdd = { playlist_id, preferences, seeds, rules };

    //TODO: check for _id

    try {
        //addToSet adds the playlist to the array if it does not exist

        //TODO: how do i only add the playlist if it does not exist?
        //and how do i update the playlist if it does exist?
        const user = await UserModel.findOneAndUpdate(
            { spotify_id: user_id },
            { $addToSet: { playlists: playlistToAdd } },
            { new: true }
        );

        return NextResponse.json(
            { message: "User Playlist created successfully", user: user },
            { status: 201 }
        );
    } catch (error) {
        if (debug) console.error("Error Adding new playlist:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error Adding new playlist",
            },
            { status: 500 }
        );
    }
}

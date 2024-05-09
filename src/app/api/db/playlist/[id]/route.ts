import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import UserModel from "@/models/userModel";
import { connectMongoDB } from "@/lib/db/dbConnect";

/* POST: Create a new playlist in users document*/
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log("POST PLAYLIST", params.id);
    const debug = true;
    const token = await getToken({ req });
    const playlist_id = params.id;

    //TODO: add authorization to the request

    const user_id = token?.userId;

    console.log("trying connectMongoDB");
    await connectMongoDB();

    const { preferences, seeds, rules } = await req.json();

    const playlistToAdd = { playlist_id, preferences, seeds, rules };

    console.log("playlistToAdd", playlistToAdd);
    try {
        //addToSet adds the playlist to the array if it does not exist
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

// /* GET: Get a user by spotify_id */
// export async function GET(req: NextRequest) {
//     const debug = true;
//     const token = await getToken({ req });
//     const { spotify_id } = await req.json();

//     if (!token || spotify_id != token.userId) {
//         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     if (debug) console.log("trying connectMongoDB");
//     await connectMongoDB();

//     //could include a double check here, to check if spotify accepsts the token
//     // const spotify = await fetch("https://api.spotify.com/v1/me", {...});

//     if (debug) console.log("GET_USER", spotify_id);
//     const user = await UserModel.findOne({ spotify_id });
//     if (!user) {
//         return NextResponse.json(
//             { message: "User not found" },
//             { status: 404 }
//         );
//     }

//     if (debug) console.log("USER_FOUND", user);
//     return NextResponse.json(user, { status: 200 });
// }

// /* PUT: Update a user by spotify_id */
// export async function PUT(req: NextRequest) {
//     const debug = true;
//     const token = await getToken({ req });
//     const { spotify_id, name } = await req.json();

//     if (!token || spotify_id != token.userId) {
//         return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     if (debug) console.log("trying connectMongoDB");
//     await connectMongoDB();

//     if (debug) console.log("UPDATE_USER", spotify_id);
//     const user = await UserModel.findOneAndUpdate(
//         { spotify_id },
//         { name },
//         { new: true } //return the updated document
//     );
//     if (!user) {
//         return NextResponse.json(
//             { message: "User not found" },
//             { status: 404 }
//         );
//     }
// }

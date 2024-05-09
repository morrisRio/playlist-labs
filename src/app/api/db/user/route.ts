import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import UserModel from "@/models/userModel";
import { connectMongoDB } from "@/lib/db/dbConnect";

/* POST: Create a new user if he does not exist*/
export async function POST(req: NextRequest) {
    const debug = false;

    //TODO:add authorization to the request

    console.log("trying connectMongoDB");
    await connectMongoDB();

    const { spotify_id, name } = await req.json();

    //check if user exists in database
    const userExists = await UserModel.findOne({ spotify_id });
    if (userExists) {
        //if user exists return success message
        if (debug) console.log("USER_ALREADY_EXISTS", userExists);
        return NextResponse.json(
            { message: "User already exists" },
            { status: 200 }
        );
    }

    if (debug) console.log("USER_DOES_NOT_EXIST", spotify_id);

    try {
        //if user does not exist, create user
        const create = await UserModel.create({
            name,
            spotify_id: spotify_id,
            playlists: [],
        });
        if (debug) console.log("CREATE", create);
        return NextResponse.json(
            { message: "User created successfully" },
            { status: 201 }
        );
    } catch (error) {
        if (debug) console.error("Error creating User:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Error creating User",
            },
            { status: 500 }
        );
    }
}

/* GET: Get a user by spotify_id */
export async function GET(req: NextRequest, verbose: boolean = false) {
    const debug = verbose;

    const token = await getToken({ req });
    const spotify_id = token?.userId;

    if (debug) console.log("trying connectMongoDB");
    await connectMongoDB();

    //could include a double check here, to check if spotify accepsts the token
    // const spotify = await fetch("https://api.spotify.com/v1/me", {...});

    if (debug) console.log("GET_USER", spotify_id);
    const user = await UserModel.findOne({ spotify_id });
    if (!user) {
        return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
        );
    }

    if (debug) console.log("USER_FOUND", user);
    return NextResponse.json(user, { status: 200 });
}

/* PUT: Update a user by spotify_id */
export async function PUT(req: NextRequest) {
    const debug = true;
    const token = await getToken({ req });
    const { spotify_id, name } = await req.json();

    if (!token || spotify_id != token.userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (debug) console.log("trying connectMongoDB");
    await connectMongoDB();

    if (debug) console.log("UPDATE_USER", spotify_id);
    const user = await UserModel.findOneAndUpdate(
        { spotify_id },
        { name },
        { new: true } //return the updated document
    );
    if (!user) {
        return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
        );
    }
}

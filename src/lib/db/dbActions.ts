"use server";

import { connectMongoDB } from "@/lib/db/dbConnect";
import { PlaylistData } from "@/types/spotify";
import User from "@/models/userModel";
import { allRules } from "@/lib/spotifyConstants";

type MongoPlaylist = {
    name: string;
    spotify_id: string;
    playlists: PlaylistData[];
};

export async function getUsersPlaylists(
    userId: string
): Promise<PlaylistData[]> {
    "use server";
    await connectMongoDB();
    try {
        console.log("searching for user", userId);
        const user = (await User.findOne(
            { spotify_id: userId },
            { _id: 0 }
        ).lean()) as MongoPlaylist;

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.playlists) {
            throw new Error("User has no playlists");
        }

        const playlists = user.playlists;

        // console.log("new playlists: ", newPlaylists);

        return playlists;
    } catch (error) {
        console.error("Error getting playlists: ", error);
        return [];
    }
}

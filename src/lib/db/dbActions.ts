"use server";

import { connectMongoDB } from "@/lib/db/dbConnect";
import { PlaylistData, MongoPlaylistData } from "@/types/spotify";
import User from "@/models/userModel";
import UserModel from "@/models/userModel";
import { Document } from "mongoose";

interface MongoUserData extends Document {
    name: string;
    spotify_id: string;
    playlists: MongoPlaylistData[];
}

/* get all Playlist from a user */
export async function dbGetUsersPlaylists(
    userId: string
): Promise<PlaylistData[]> {
    await connectMongoDB();
    try {
        console.log("searching for user", userId);
        const user = (await User.findOne(
            { spotify_id: userId },
            { _id: 0 }
        ).lean()) as MongoUserData;

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.playlists) {
            throw new Error("User has no playlists");
        }

        const playlists = user.playlists;

        playlists.forEach((playlist) => {
            delete playlist._id;
        });

        return playlists as PlaylistData[];
    } catch (error) {
        console.error("Error getting playlists: ", error);
        return [];
    }
}

/* get a single Playlist from a user */
export async function dbGetOnePlaylist(
    userId: string,
    playlistId: string
): Promise<PlaylistData | null> {
    //for fetching only one playlist: https://www.mongodb.com/docs/manual/tutorial/optimize-query-performance-with-indexes-and-projections/
    await connectMongoDB();

    // projection to only get the playlist with the id
    const { playlists } = (await User.findOne(
        { spotify_id: userId },
        {
            playlists: {
                $elemMatch: { playlist_id: playlistId },
            },
            _id: 0,
        }
    ).lean()) as MongoUserData;

    const playlist = playlists[0];
    delete playlist._id;

    return playlist as PlaylistData;
}

//TODO review types
export async function dbCreatePlaylist(
    userId: string,
    playlistData: PlaylistData
): Promise<any> {
    await connectMongoDB();
    try {
        const user = await UserModel.findOneAndUpdate(
            { spotify_id: userId },
            { $addToSet: { playlists: playlistData } },
            { new: true }
        );
        console.log("User Playlist created successfully", user);
        return user;
    } catch (error) {
        console.error("Error Adding new playlist:", error);
        return null;
    }
}

export async function dbUpdatePlaylist(
    userId: string,
    playlistData: PlaylistData
): Promise<any> {
    await connectMongoDB();
    try {
        const user = await UserModel.findOneAndUpdate(
            {
                spotify_id: userId,
                "playlists.playlist_id": playlistData.playlist_id,
            },
            { $set: { "playlists.$": playlistData } },
            { new: true }
        );
        console.log("User Playlist updated successfully", user);
        return user;
    } catch (error) {
        console.error("Error updating playlist:", error);
        return null;
    }
}

"use server";

import { connectMongoDB } from "@/lib/db/dbConnect";
import { PlaylistData, MongoPlaylistData } from "@/types/spotify";
import User from "@/models/userModel";
import UserModel from "@/models/userModel";
import { Document } from "mongoose";
import { debugLog, setDebugMode } from "@/lib/utils";

interface MongoUserData extends Document {
    name: string;
    spotify_id: string;
    playlists: MongoPlaylistData[];
}

/**
 * Registers a new user with their Spotify ID and name.
 *
 * @async
 * @function dbRegisterUser
 * @param {string} userId - The Spotify ID of the user.
 * @param {string} name - The name of the user.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is successfully registered or already exists, and false if an error occurs.
 */
export async function dbRegisterUser(userId: string, name: string): Promise<boolean> {
    setDebugMode(false);

    await connectMongoDB();
    if (!userId || !name) return false;

    if (await UserModel.exists({ spotify_id: userId })) {
        debugLog("User already exists");
        return true;
    }

    try {
        const user = await UserModel.create({
            name,
            spotify_id: userId,
            playlists: [],
        });
        debugLog("User created successfully", user);
        return true;
    } catch (error) {
        console.error("Error creating User:", error);
        return false;
    }
}

/**
 * Retrieves all playlists from a user by their Spotify ID.
 *
 * @async
 * @function dbGetUsersPlaylists
 * @param {string} userId - The Spotify ID of the user.
 * @returns {Promise<PlaylistData[] | Object>} A promise that resolves to an array of playlist data, or an empty array if an error occurs.
 * @throws {Error} Will throw an error if the user is not found or if the user has no playlists.
 */

interface PlaylistResponseDB {
    playlists: PlaylistData[];
    error: string | null;
}

export async function dbGetUsersPlaylists(userId: string): Promise<PlaylistResponseDB> {
    setDebugMode(true);
    await connectMongoDB();
    try {
        debugLog("searching for user", userId);
        const user = (await User.findOne({ spotify_id: userId }, { _id: 0 }).lean()) as MongoUserData;

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

        return { playlists: playlists, error: null } as PlaylistResponseDB;
    } catch (error: any) {
        console.error("Error getting playlists: ", error);
        return { playlists: [], error: error.message } as PlaylistResponseDB;
    }
}

/**
 * Fetches a single playlist for a user based on the user's Spotify ID and the playlist ID.
 *
 * @async
 * @function dbGetOnePlaylist
 * @param {string} userId - The Spotify ID of the user.
 * @param {string} playlistId - The ID of the playlist to fetch.
 * @returns {Promise<PlaylistData | null>} A promise that resolves to the playlist data if found, or null if not found.
 */
export async function dbGetOnePlaylist(userId: string, playlistId: string): Promise<PlaylistData | null> {
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

/**
 * Adds a new playlist to the specified user's playlists in the database.
 *
 * @param {string} userId - The Spotify ID of the user.
 * @param {PlaylistData} playlistData - The data of the playlist to be added.
 * @returns {Promise<boolean>} - Returns true if the playlist was successfully added, false otherwise.
 */
export async function dbCreatePlaylist(userId: string, playlistData: PlaylistData): Promise<boolean> {
    await connectMongoDB();
    try {
        const result = await UserModel.updateOne({ spotify_id: userId }, { $addToSet: { playlists: playlistData } });

        if (!result.acknowledged) throw new Error("Error adding playlist to user");
        return true;
    } catch (error) {
        console.error("Error Adding new playlist:", error);
        return false;
    }
}

/**
 * Updates an existing playlist in the specified user's playlists in the database.
 *
 * @param {string} userId - The Spotify ID of the user.
 * @param {PlaylistData} playlistData - The updated data of the playlist.
 * @returns {Promise<boolean>} - Returns true if the playlist was successfully updated, false otherwise.
 */
export async function dbUpdatePlaylist(userId: string, playlistData: PlaylistData): Promise<boolean> {
    await connectMongoDB();
    try {
        const result = await UserModel.updateOne(
            {
                spotify_id: userId,
                "playlists.playlist_id": playlistData.playlist_id,
            },
            { $set: { "playlists.$": playlistData } }
        );
        if (!result.acknowledged) throw new Error("Change not acknowledged in DB");
        return true;
    } catch (error) {
        console.error("Error updating playlist:", error);
        return false;
    }
}

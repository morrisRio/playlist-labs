"use server";

import { connectMongoDB } from "@/lib/db/dbConnect";
import { PlaylistData, MongoPlaylistData, MongoAccount } from "@/types/spotify";
import User from "@/models/userModel";
import UserModel from "@/models/userModel";
import AccountModel from "@/models/accountModel";
import { Document } from "mongoose";
import { debugLog, setDebugMode } from "@/lib/utils";
import { auth } from "../serverUtils";
import { revalidateTag } from "next/cache";

type DbRes<T> =
    | {
          data: T;
          error: string | null;
      }
    | DbError;

interface DbError {
    data: null;
    error: string;
}

export async function dbGetAllUsers(): Promise<DbRes<MongoUserData[]>> {
    await connectMongoDB();
    try {
        const playlists = await UserModel.find({});
        return { data: playlists as MongoUserData[], error: null };
    } catch (error: any) {
        console.error("Error getting playlists: ", error);
        return { data: null, error: error.message };
    }
}

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
 * @param {string} accessToken - The user's Spotify access token.
 * @param {string} refreshToken - The user's Spotify refresh token.
 * @param {number} expiresAt - The timestamp when the access token expires.
 * @returns {Promise<boolean>} A promise that resolves to true if the user is successfully registered or already exists, and false if an error occurs.
 */
export async function dbRegisterUser(
    userId: string,
    name: string | null | undefined,
    accessToken: string,
    refreshToken: string,
    expiresAt: number
): Promise<boolean> {
    await connectMongoDB();
    if (!userId) return false;

    if ((await UserModel.exists({ spotify_id: userId })) && (await AccountModel.exists({ spotify_id: userId }))) {
        debugLog("User already exists");
        return true;
    }

    let accountSuccess = false;
    let userSuccess = false;
    try {
        const userDoc = await UserModel.create({
            name: name ? name : userId,
            spotify_id: userId,
            playlists: [],
        });
        debugLog("User created successfully", userDoc);
        userSuccess = true;
    } catch (error: any) {
        console.error("Error creating User:", error.message);
    }

    try {
        const accountDoc = await AccountModel.create({
            spotify_id: userId,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires: expiresAt,
        });
        debugLog("Account created successfully", accountDoc);
        accountSuccess = true;
    } catch (error: any) {
        console.error("Error creating Account:", error.message);
    }

    return userSuccess || accountSuccess;
}

export async function dbGetAccountByUserId(userId: string): Promise<DbRes<MongoAccount>> {
    await connectMongoDB();
    try {
        const account = await AccountModel.findOne({ spotify_id: userId });
        return { data: account as MongoAccount, error: null };
    } catch (error: any) {
        console.error("Error getting account: ", error);
        return { data: null, error: error.message };
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

export async function dbGetUsersPlaylists(userId: string): Promise<DbRes<PlaylistData[]>> {
    setDebugMode(false);
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

        return { data: playlists, error: null };
    } catch (error: any) {
        console.error("Error getting playlists: ", error);
        return { data: [], error: error.message };
    }
}

/**
 * Fetches a single playlist for a user based on the user's Spotify ID and the playlist ID.
 *
 * @async
 * @function dbGetOnePlaylistData
 * @param {string} userId - The Spotify ID of the user.
 * @param {string} playlistId - The ID of the playlist to fetch.
 * @returns {Promise<DbRes<PlaylistData>>} A promise that resolves to the playlist data if found, or null if not found.
 */
export async function dbGetOnePlaylistData(userId: string, playlistId: string): Promise<DbRes<PlaylistData>> {
    //for fetching only one playlist: https://www.mongodb.com/docs/manual/tutorial/optimize-query-performance-with-indexes-and-projections/
    try {
        await connectMongoDB();
        setDebugMode(false);
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

        debugLog("Playlist found:", playlist);

        return { data: playlist as PlaylistData, error: null };
    } catch (error: any) {
        console.error("Error getting playlist:", error);
        return { data: null, error: error.message };
    }
}

export async function dbGetOneUserPlaylist(userId: string, playlistId: string): Promise<DbRes<MongoUserData | null>> {
    //for fetching only one playlist: https://www.mongodb.com/docs/manual/tutorial/optimize-query-performance-with-indexes-and-projections/
    await connectMongoDB();

    // projection to only get the playlist with the id
    const userDoc = await User.findOne(
        { spotify_id: userId },
        {
            playlists: {
                $elemMatch: { playlist_id: playlistId },
            },
            _id: 0,
        }
    );

    // const playlist = playlists[0];

    return { data: userDoc as MongoUserData, error: null };
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
 * @param {string[]} newTracks - Optional: An array of new track IDs to add to the trackHistory.
 * @returns {Promise<boolean>} - Returns true if the playlist was successfully updated, false otherwise.
 */
export async function dbUpdatePlaylist(
    userId: string,
    playlistData: PlaylistData,
    newTracks?: string[]
): Promise<boolean> {
    await connectMongoDB();
    try {
        let updateOperation: any = {
            $set: { "playlists.$": { ...playlistData, lastUpdated: Date.now() } },
        };

        // // If newTracks are provided, add them to the trackHistory
        // if (newTracks && newTracks.length > 0) {
        //     updateOperation.$push = {
        //         "playlists.$.trackHistory": {
        //             $each: newTracks,
        //         },
        //     };
        // }

        const result = await UserModel.updateOne(
            {
                spotify_id: userId,
                "playlists.playlist_id": playlistData.playlist_id,
            },
            updateOperation
        );

        if (!result.acknowledged) throw new Error("Change not acknowledged in DB");
        return true;
    } catch (error) {
        console.error("Error updating playlist:", error);
        return false;
    }
}

export async function dbDeletePlaylist(playlistId: string): Promise<boolean> {
    //redundant authentication
    const session = await auth();
    const userId = session?.user.id;
    await connectMongoDB();
    try {
        const result = await UserModel.updateOne(
            { spotify_id: userId },
            { $pull: { playlists: { playlist_id: playlistId } } }
        );
        if (!result.acknowledged) throw new Error("Change not acknowledged in DB");
        revalidateTag("playlists");
        return true;
    } catch (error) {
        console.error("Error deleting playlist:", error);
        return false;
    }
}

export async function dbDeleteUser(): Promise<boolean> {
    //redundant authentication
    const session = await auth();
    const userId = session?.user.id;
    await connectMongoDB();
    try {
        const resultUser = await UserModel.deleteOne({ spotify_id: userId });
        const resultAccount = await AccountModel.deleteOne({ spotify_id: userId });
        if (!resultUser.acknowledged && !resultAccount.acknowledged) throw new Error("Change not acknowledged in DB");
        return true;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
}

export async function dbGetPlaylistHistory(userId: string, playlistId: string): Promise<DbRes<string[]>> {
    await connectMongoDB();
    try {
        // Query to find the specific track history of the playlist
        const result = await User.findOne(
            { spotify_id: userId, "playlists.playlist_id": playlistId },
            {
                playlists: { $elemMatch: { playlist_id: playlistId } },
                "playlists.trackhistory": 1,
                _id: 0,
            }
        ).lean();

        console.log("Result: ", result);
        // Extract the trackhistory if it exists
        // const trackHistory = result?.playlistst?.[0]?.trackhistory || ["No history found"];
        const trackHistory = ["No history found"];
        return { data: trackHistory, error: null };
    } catch (error: any) {
        console.error("Error getting playlist history: ", error);
        return { data: [], error: error.message };
    }
}

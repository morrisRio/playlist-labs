"use server";
import { revalidateTag } from "next/cache";
import { Document } from "mongoose";

import { auth } from "../serverUtils";
import { connectMongoDB } from "@/lib/db/dbConnect";
import { debugLog } from "@/lib/utils";

import { PlaylistData, MongoPlaylistData, MongoAccount, Preferences, PlaylistUpdate } from "@/types/spotify";

import UserModel from "@/models/userModel";
import AccountModel from "@/models/accountModel";
import LogModel from "@/models/logModel";

import exampleUser from "@/lib/db/exampleUser";

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

    const userExists = await UserModel.exists({ spotify_id: userId });
    const accountExists = await AccountModel.exists({ spotify_id: userId });

    if (userExists && accountExists) {
        debugLog("User already exists");
        return true;
    }

    let accountSuccess = false;
    let userSuccess = false;
    if (!userExists) {
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
    }

    if (!accountExists) {
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
    }

    setupExampleUser(name || userId, userId);

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
    await connectMongoDB();
    try {
        debugLog("searching for user", userId);
        const user = (await UserModel.findOne({ spotify_id: userId }, { _id: 0 }).lean()) as MongoUserData;

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
        // projection to only get the playlist with the id
        const { playlists } = (await UserModel.findOne(
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

        return { data: playlist as PlaylistData, error: null };
    } catch (error: any) {
        console.error("Error getting playlist:", error);
        return { data: null, error: error.message };
    }
}

export async function dbGetOneUserPlaylist(userId: string, playlistId: string): Promise<DbRes<MongoUserData>> {
    //for fetching only one playlist: https://www.mongodb.com/docs/manual/tutorial/optimize-query-performance-with-indexes-and-projections/
    try {
        await connectMongoDB();

        // projection to only get the playlist with the id
        const userDoc = await UserModel.findOne(
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
    } catch (error: any) {
        console.error("Error getting playlist:", error);
        return { data: null, error: error.message };
    }
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
export async function dbUpdatePlaylist(userId: string, playlistData: PlaylistUpdate): Promise<DbRes<boolean>> {
    await connectMongoDB();
    try {
        const updateOperation: any = {};
        const setOperation: any = {};

        if (playlistData.preferences) {
            setOperation["playlists.$.preferences"] = playlistData.preferences;
        }
        if (playlistData.seeds) {
            setOperation["playlists.$.seeds"] = playlistData.seeds;
        }
        if (playlistData.rules !== undefined) {
            setOperation["playlists.$.rules"] = playlistData.rules;
        }
        if (playlistData.trackHistory) {
            setOperation["playlists.$.trackHistory"] = playlistData.trackHistory;
        }

        setOperation["playlists.$.lastUpdated"] = Date.now();

        updateOperation.$set = setOperation;

        debugLog("Update Operation:", updateOperation);

        const result = await UserModel.updateOne(
            {
                spotify_id: userId,
                "playlists.playlist_id": playlistData.playlist_id,
            },
            updateOperation
        );

        if (!result.acknowledged) throw new Error("Change not acknowledged in DB");
        return { data: true, error: null };
    } catch (error: any) {
        console.error("Error updating playlist:", error);
        return { data: false, error: error.message };
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

export async function setupExampleUser(userId: string, name: string): Promise<boolean> {
    const playlistData = exampleUser.playlists;
    try {
        const result = await UserModel.updateOne({ spotify_id: userId }, { $addToSet: { playlists: playlistData } });

        if (!result.acknowledged) throw new Error("Error adding playlist to user");
        return true;
    } catch (error) {
        console.error("Error Adding new playlist:", error);
        return false;
    }
}

export async function dbResetDemoPlaylists(): Promise<boolean> {
    await connectMongoDB();
    try {
        const result = await UserModel.updateOne({ spotify_id: "karate_morris" }, { playlists: exampleUser.playlists });

        dbLogAction("Reset Demo Playlists", result.acknowledged, result);

        if (!result.acknowledged) throw new Error("Error adding playlist to user");
        return true;
    } catch (error) {
        console.error("Error Adding new playlist:", error);
        return false;
    }
}

export async function dbLogAction(action: string, success: boolean, info: any) {
    const logEntry = new LogModel({
        action,
        success,
        info,
    });
    await logEntry.save();
    console.log("Log saved:", logEntry);
}

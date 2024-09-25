import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { spotifyPost, spotifyPut, spotifyGet } from "@/lib/serverUtils";
import {
    getRecommendations,
    createPlaylistDescription,
    getOnlyNewRecommendations,
    trackIdsToQuery,
    regeneratePlaylist,
    regenerateRes,
} from "@/lib/spotifyUtils";
import { getToken } from "next-auth/jwt";
import { MongoPlaylistData, PlaylistData } from "@/types/spotify";
import { dbCreatePlaylist, dbGetOneUserPlaylist, dbUpdatePlaylist } from "@/lib/db/dbActions";
import { debugLog, setDebugMode } from "@/lib/utils";
import { revalidateTag } from "next/cache";
import { createCanvas } from "@napi-rs/canvas";
import { createCanvasGradient } from "@/lib/utils";

//needs to be here because of the canvas dependency leading to bundler issues if not in api route
const generateCoverImage = async (hue: number): Promise<string> => {
    debugLog("API: Generating Cover Image with Hue:", hue);
    const canvas = createCanvas(640, 640);
    createCanvasGradient(canvas, hue);
    const buffer = canvas.toDataURL("image/jpeg");
    const base64JpegData = buffer.replace(/^data:image\/\w+;base64,/, "");
    return base64JpegData;
};

const updatePlaylistCover = async (hue: number, idToWriteTo: string, accessToken: string): Promise<void> => {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Playlist cover update timed out after 10s")), 10 * 60 * 1000); //10 minutes
    });

    try {
        await Promise.race([
            (async () => {
                const coverImageData = await generateCoverImage(hue);
                debugLog("API: Generated Cover Image. Sending to Spotify");
                const res = await spotifyPut(
                    `https://api.spotify.com/v1/playlists/${idToWriteTo}/images`,
                    accessToken,
                    coverImageData,
                    { "Content-Type": "image/jpeg" }
                );
                debugLog("API: Added Cover Image to Playlist:", res);
            })(),
            timeoutPromise,
        ]);
    } catch (error) {
        console.error("Failed to update playlist cover:", error);
        throw error;
    }
};

export async function POST(req: NextRequest): Promise<NextResponse> {
    setDebugMode(true);

    const data = await req.json();
    const { preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST POST - creating new playlist ", preferences);
    debugLog("API: data received", data);

    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { accessToken, userId } = token;

    //complete the request body with the description and public fields
    const createBody = {
        name: preferences.name,
        description: createPlaylistDescription(preferences, seeds, rules),
        public: false,
    };

    //make the api call to create the playlist and save the id for the created playlist
    debugLog(" - creating the playlist");

    const validatePlaylist = (data: any) => {
        if (!data.id || typeof data.id !== "string") {
            return { valid: false, message: "Spotify didn't accept creation", status: 500 };
        }
        return { valid: true };
    };

    const newPlaylistRes = await spotifyPost(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        accessToken,
        createBody,
        validatePlaylist
    );
    if (newPlaylistRes.error) {
        const { message, status } = newPlaylistRes.error;
        return NextResponse.json({ message: "Failed to create Playlist.\n" + message }, { status });
    }

    const { id: idToWriteTo } = newPlaylistRes;
    debugLog(" - created playlist with id: " + idToWriteTo);

    //get the recommendations and add them to the body for the api call that adds the tracks to the playlist
    const recommandationIds = await getRecommendations(accessToken, preferences.amount, seeds, rules);

    if ("error" in recommandationIds) {
        const { message, status } = recommandationIds.error;
        return NextResponse.json(
            { message: "Failed to get Recommendations.\n Maybe your Settings are very limiting.\n" + message },
            { status }
        );
    }
    //add the tracks to the playlist
    const recommandationQuery = trackIdsToQuery(recommandationIds);
    const addBody = {
        uris: recommandationQuery,
    };

    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${idToWriteTo}/tracks`,
        accessToken,
        addBody
    );

    if (addRes.error) {
        const { message, status } = addRes.error;
        return NextResponse.json({ message }, { status });
    }

    debugLog("API: Added Tracks to Playlist:", addRes);

    //add the cover image to the playlist
    const hue = preferences.hue || Math.floor(Math.random() * 360);
    delete preferences.hue;
    await updatePlaylistCover(hue, idToWriteTo, accessToken).catch((error) => {
        console.error("Failed to update Cover Image", error);
    });

    //add playlist to user document DB
    const dbSuccess = await dbCreatePlaylist(userId, {
        playlist_id: idToWriteTo,
        preferences,
        seeds,
        rules,
        trackHistory: recommandationIds,
    });

    if (!dbSuccess) {
        return NextResponse.json(
            {
                message: "Created successfully on Spotify but failed to save to database",
            },
            { status: 500 }
        );
    }
    revalidateTag("playlists");
    return NextResponse.json(idToWriteTo, { status: 201 });
}

//TODO: check if playlist exists in spotify (could be deleted by user) -> if there is no playlist id mathing the one in db call post
export async function PUT(req: NextRequest): Promise<NextResponse> {
    setDebugMode(true);
    debugLog("API: PLAYLIST PUT - updating playlist ================================================");
    const data = await req.json();

    if (!data.playlist_id) {
        return NextResponse.json({ message: "No Playlist ID provided" }, { status: 400 });
    }
    const { playlist_id, preferences, seeds, rules }: PlaylistData = data;

    debugLog("API: PLAYLIST PUT - updating playlist " + playlist_id);
    debugLog("API: data received", data);

    //get the access token from the request
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }
    const { accessToken, userId } = token;

    //update cover if hue is provided
    if (preferences && preferences.hue !== undefined) {
        await updatePlaylistCover(preferences.hue, playlist_id, accessToken).catch((error) => {
            console.error("Failed to update Cover Image: ", error);
        });
        delete preferences.hue;
    }

    const dbUserPlaylistData = await dbGetOneUserPlaylist(userId, playlist_id);
    if (dbUserPlaylistData.error || !dbUserPlaylistData.data || dbUserPlaylistData.data.playlists.length === 0) {
        return NextResponse.json({ message: "Failed to get playlist data from database." }, { status: 500 });
    }
    const dbPlaylistData = dbUserPlaylistData.data.playlists[0] as MongoPlaylistData;

    //get new recommendations and add them to the playlist
    let update: regenerateRes;
    if (data.newSongsSettings && preferences && seeds) {
        //settings changed, regenerate and save settings while ignoring the old tracks
        update = await regeneratePlaylist(
            {
                playlist_id,
                preferences,
                seeds,
                rules,
                trackHistory: dbPlaylistData.trackHistory,
            } as PlaylistData,
            accessToken,
            userId,
            true
        );

        if (update.error) {
            const { message, status } = update.error;
            return NextResponse.json({ message }, { status });
        }
        //TODO: fidelity: save all tracks to history with date and settingshash, so versions can be shown in frontend
        const dbSuccess = await dbUpdatePlaylist(userId, {
            playlist_id,
            preferences: update.data.preferences,
            seeds: update.data.seeds,
            rules: update.data.rules,
            trackHistory: update.data.trackHistory,
        });
        if (!dbSuccess) {
            console.error("Failed to save updated Playlist Data");
        }
    } else if (!data.newSongSettings) {
        // only run another generation with setting from db
        update = await regeneratePlaylist(
            dbUserPlaylistData.data.playlists[0] as MongoPlaylistData,
            accessToken,
            userId,
            false
        );

        if (update.error) {
            const { message, status } = update.error;
            return NextResponse.json({ message }, { status });
        }
        //TODO: fidelity: save all tracks to history with date and settingshash, so versions can be shown in frontend
        const dbSuccess = await dbUpdatePlaylist(userId, {
            playlist_id,
            trackHistory: update.data.trackHistory,
        });
        if (!dbSuccess) {
            console.error("Failed to save updated Playlist Data");
        }
    } else {
        return NextResponse.json(
            { message: "To regenerate a Playlist with new Settings, you must provide those new settings" },
            { status: 418 }
        );
    }

    // const exists = await spotifyGet(
    //     `https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains`,
    //     accessToken
    // );
    // //if the playlist does not exist, follow the old one again
    // if (!exists[0]) {
    //     const followRes = await spotifyPut(
    //         `https://api.spotify.com/v1/playlists/${playlist_id}/followers`,
    //         accessToken,
    //         { public: false }
    //     );
    //     if (followRes.error) {
    //         const { status } = followRes.error;
    //         return NextResponse.json({ message: "Seems like the Playlist doesn't exist anymore\n" }, { status });
    //     }
    // }

    // debugLog(" - checking if playlist exists", exists);

    // const preferencesBody = {
    //     name: preferences.name,
    //     description: createPlaylistDescription(preferences, seeds, rules),
    //     public: false,
    // };

    // const updatePlaylistDetails = await spotifyPut(
    //     `https://api.spotify.com/v1/playlists/${playlist_id}`,
    //     accessToken,
    //     preferencesBody
    // );

    // if (updatePlaylistDetails.error) {
    //     const { message, status } = updatePlaylistDetails.error;
    //     return NextResponse.json({ message: "Problem updating Playlist details.\n" + message }, { status });
    // }

    // //flush the playlist
    // debugLog(" - flushing the playlist");
    // const flushRes = await spotifyPut(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, accessToken, {
    //     uris: [],
    // });

    // if (flushRes.error) {
    //     const { message, status } = flushRes.error;
    //     return NextResponse.json({ message: "Failed deleting old Tracks.\n" + message }, { status });
    // }

    // const dbUserPlaylistData = await dbGetOneUserPlaylist(userId, playlist_id);
    // if (dbUserPlaylistData.error || !dbUserPlaylistData.data || dbUserPlaylistData.data.playlists.length === 0) {
    //     return NextResponse.json({ message: "Failed to get playlist data from database." }, { status: 500 });
    // }
    // const dbPlaylistData = dbUserPlaylistData.data.playlists[0];
    // let trackIdsToAdd = await getOnlyNewRecommendations(accessToken, preferences, seeds, rules, dbPlaylistData);
    // if ("error" in trackIdsToAdd) {
    //     console.error("API: Failed to get only new Tracks", trackIdsToAdd.error);
    //     console.error("trying simple recommandations instead");

    //     const recommandationIds = await getRecommendations(accessToken, preferences.amount, seeds, rules);

    //     if ("error" in recommandationIds) {
    //         console.error("API: END: Failed to get Recommendations", recommandationIds.error);
    //         const { message, status } = recommandationIds.error;
    //         return NextResponse.json(
    //             {
    //                 message: "Failed to get Recommendations. \n" + message,
    //             },
    //             { status }
    //         );
    //     }
    //     trackIdsToAdd = recommandationIds;
    // }

    // //add the tracks to the playlist
    // const recommandationQuery = trackIdsToQuery(trackIdsToAdd);

    // const addBody = {
    //     uris: recommandationQuery,
    // };

    // const addRes = await spotifyPost(
    //     `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
    //     accessToken,
    //     addBody,
    //     undefined
    // );

    // if (addRes.error) {
    //     const { message, status } = addRes.error;
    //     return NextResponse.json({ message: "Failed adding new Tracks.\n" + message }, { status });
    // }

    // if (preferences.hue !== undefined) {
    //     await updatePlaylistCover(preferences.hue, playlist_id, accessToken).catch((error) => {
    //         console.error("Failed to update Cover Image: ", error);
    //     });
    //     delete preferences.hue;
    // }

    // const dbSuccess = await dbUpdatePlaylist(userId, {
    //     playlist_id,
    //     preferences,
    //     seeds,
    //     rules,
    //     trackHistory: [...dbPlaylistData.trackHistory, ...trackIdsToAdd],
    //     // trackHistory: [...dbPlaylistData.data.trackHistory, ...tracksToAdd],
    // });

    // if (!dbSuccess) {
    //     return NextResponse.json(
    //         {
    //             message: "Updated successfully on Spotify but failed to save changes to database.",
    //         },
    //         { status: 500 }
    //     );
    // }
    //TO HERE================================================================================================

    revalidateTag("playlists");
    return NextResponse.json(playlist_id, { status: 201 });
}

//TODO: PATCH to only regenerate with previous settings

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    setDebugMode(true);

    debugLog("API: PLAYLIST PATCH - updating playlist");
    const data = await req.json();
    const { playlist_id, preferences } = data;

    const token = await getToken({ req });

    if (!token) {
        console.error("No token found");
        return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { accessToken, userId } = token;

    const preferencesBody = {
        name: preferences.name,
        public: false,
    };

    const updatePlaylistDetails = await spotifyPut(
        `https://api.spotify.com/v1/playlists/${playlist_id}`,
        accessToken,
        preferencesBody
    );

    if (preferences.hue !== undefined) {
        await updatePlaylistCover(preferences.hue, playlist_id, accessToken).catch((error) => {
            console.error("Failed to update Cover Image: ", error);
        });
        delete preferences.hue;
    }

    const dbUpdate = await dbUpdatePlaylist(userId, {
        playlist_id,
        preferences,
    });

    if (dbUpdate.error && updatePlaylistDetails.error) {
        return NextResponse.json(
            {
                message: "Failed to update Playlist",
            },
            { status: 500 }
        );
    }

    if (updatePlaylistDetails.error) {
        return NextResponse.json(
            {
                message: "Failed to update Playlist details on Spotify.",
            },
            { status: 500 }
        );
    }

    if (dbUpdate.error) {
        console.error("Failed to save changes to database.", dbUpdate.error);
        return NextResponse.json(
            {
                message: "Failed to save changes to database.",
            },
            { status: 500 }
        );
    }

    return NextResponse.json(playlist_id, { status: 200 });
}

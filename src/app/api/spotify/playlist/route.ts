import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { getToken } from "next-auth/jwt";

import { createCanvas, loadImage } from "@napi-rs/canvas";

import { resolve } from "path";

import {
    sanitizeAndValidatePreferences,
    sanitizeBoolean,
    sanitizeString,
    vsPlaylistData,
    vsPlaylistRefreshData,
} from "@/lib/securityUtils";

import { spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { getRecommendations, createPlaylistDescription, trackIdsToQuery, regeneratePlaylist } from "@/lib/spotifyUtils";
import { debugLog, setDebugMode, createCanvasGradient } from "@/lib/utils";
import { dbCreatePlaylist, dbGetOneUserPlaylist, dbUpdatePlaylist } from "@/lib/db/dbActions";

import { MongoPlaylistData, PlaylistData, Preferences, Rule, Seed } from "@/types/spotify";

//open.spotify.com/track/2ixjhaUi4RoVVjvBmqIGQ9?si=8f72acbbc354441d

const songsForMessage: string[] = [
    "2sCUDVNDIlZPDk8YUnvRHe", //pretty
    "3wgFybQqJMYptaAvF8v612", //sad
    "6FFvuYv3fmUqisQkjyVLh6", //spotify
    "0imwtLGiD7fCyWq7SpslPl", //decided
    "0Hs0nIYyIUP8NE1ezwSgPK", //to
    "2Kd20WpHQe8lviQfmydMgq", //deprecate
    "2nHN5GyGUkM9UBnEalJDKH", //these
    "6j3KiKiSZP9lmQwR3ZtcmH", //API
    "4D4ZUpU7ZVDOCO2rgRlCAd", //Endpoints
    "2n1WH7I33C9Tm47unwnp8U", //...
    "2ixjhaUi4RoVVjvBmqIGQ9", //anyways,
    "1id4jZEc1R0QgeoJg82x0s", //hire me!
];

//needs to be here because of the canvas dependency leading to bundler issues if not in api route, for the same reason we load the image here
const generateCoverImage = async (hue: number): Promise<string> => {
    debugLog("API: Generating Cover Image with Hue:", hue);
    const canvas = createCanvas(640, 640);

    const dirRelativeToPublicFolder = ".";
    const dir = resolve("./public", dirRelativeToPublicFolder);
    const pathToLogo = dir + "/logo-v2.svg";
    const logo = await loadImage(pathToLogo);

    createCanvasGradient(canvas, hue, logo);
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
    try {
        setDebugMode(true);
        const rawData = await req.json();

        const validation = vsPlaylistData(rawData);
        if (!validation.valid) {
            return NextResponse.json({ errors: validation.errors }, { status: 400 });
        }

        const { preferences, seeds, rules } = validation.sanitizedData;

        debugLog("API: PLAYLIST POST - creating new playlist ", preferences);
        debugLog("API: PLAYLIST POST - data received", validation.sanitizedData);

        const token = await getToken({ req });
        if (!token) {
            console.error("API: PLAYLIST POST - Error: No token found");
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
        debugLog("API: PLAYLIST POST - creating the playlist");

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
        debugLog("API: PLAYLIST POST - created playlist with id: " + idToWriteTo);

        //add playlist to user document DB
        const dbSuccess = await dbCreatePlaylist(userId, {
            playlist_id: idToWriteTo,
            preferences,
            seeds,
            rules,
            trackHistory: [{ tracks: songsForMessage, added_at: new Date() }],
        });
        debugLog("API: PLAYLIST POST - saved to database", dbSuccess);
        //DEPRECATED API ENDPOINTS
        //get the recommendations and add them to the body for the api call that adds the tracks to the playlist
        // const recommandationIds = await getRecommendations(accessToken, preferences.amount, seeds, rules);

        // if ("error" in recommandationIds) {
        //     const { message, status } = recommandationIds.error;
        //     return NextResponse.json(
        //         { message: "Failed to get Recommendations.\n Maybe your Settings are very limiting.\n" + message },
        //         { status }
        //     );
        // }
        //add the tracks to the playlist
        const trackQuery = trackIdsToQuery(songsForMessage);
        const addBody = {
            uris: trackQuery,
        };
        debugLog("API: PLAYLIST POST - Adding Tracks to Playlist", addBody);

        const addRes = await spotifyPost(
            `https://api.spotify.com/v1/playlists/${idToWriteTo}/tracks`,
            accessToken,
            addBody
        );

        if (addRes.error) {
            console.log("ERROR - API: PLAYLIST POST - Failed to add Tracks to Playlist", addRes.error);
            const { message, status } = addRes.error;
            return NextResponse.json({ message }, { status });
        }

        debugLog("API: PLAYLIST POST - Added Tracks to Playlist:", addRes);

        //add the cover image to the playlist
        const hue = preferences.hue || Math.floor(Math.random() * 360);
        delete preferences.hue;
        await updatePlaylistCover(hue, idToWriteTo, accessToken).catch((error) => {
            console.error("API: PLAYLIST POST - Failed to update Cover Image", error);
        });
        //timeout to wait for spotify to change the playlist cover
        await new Promise((resolve) => setTimeout(resolve, 500));

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
    } catch (error) {
        console.error("API: PLAYLIST POST - Failed to create Playlist", error);
        return NextResponse.json({ message: "Failed to create Playlist" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        setDebugMode(true);
        debugLog("API: PLAYLIST PUT - updating playlist");

        //get the access token from the request
        const token = await getToken({ req });
        if (!token) {
            console.error("No token found");
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }
        const { accessToken, userId } = token;

        //get the data from the request
        const rawData = await req.json();
        debugLog("API: PLAYLIST PUT - data received", rawData);
        const newSongSettings = sanitizeBoolean(rawData.newSongsSettings);
        debugLog("API: PLAYLIST PUT - newSongSettings", newSongSettings);

        let playlist_id: string;
        let preferences: Preferences | undefined;
        let seeds: Seed[] | undefined;
        let rules: Rule[] | undefined;

        //validate input data while differentiating between new settings and refresh
        if (newSongSettings) {
            const validation = vsPlaylistData(rawData);
            if (!validation.valid) {
                return NextResponse.json({ errors: validation.errors }, { status: 400 });
            }
            const { playlist_id: id, preferences: prefs, seeds: seedlings, rules: rls } = validation.sanitizedData;
            if (!id) {
                return NextResponse.json({ message: "No Playlist ID provided" }, { status: 400 });
            }
            //assign the data to the variables set before
            //we opt for this approach to use the same variables later on, for new settings and refresh
            playlist_id = id;
            preferences = prefs;
            seeds = seedlings;
            rules = rls;
        } else {
            const validation = vsPlaylistRefreshData(rawData);
            if (!validation.valid) {
                return NextResponse.json({ errors: validation.errors }, { status: 400 });
            }
            const { playlist_id: id } = validation.sanitizedData;
            if (!id) {
                return NextResponse.json({ message: "No Playlist ID provided" }, { status: 400 });
            }
            playlist_id = id;
        }

        //update cover if hue is provided
        if (preferences && preferences.hue !== undefined) {
            await updatePlaylistCover(preferences.hue, playlist_id, accessToken).catch((error) => {
                console.error("API: PLAYLIST PUT - Failed to update Cover Image: ", error);
            });
            delete preferences.hue;
        }

        //DEPRECATED API ENDPOINTS
        //WE NOW JUST UPDATE DB AND THE PLAYLIST DESCRIPTION IF SOMETHING IS CHANGED
        //get the playlist data from the database, for refresh everything is need from the db
        //for new settings only the track history is needed,
        // const dbUserPlaylistData = await dbGetOneUserPlaylist(userId, playlist_id);
        // if (dbUserPlaylistData.error || !dbUserPlaylistData.data || dbUserPlaylistData.data.playlists.length === 0) {
        //     return NextResponse.json({ message: "Failed to get playlist data from database." }, { status: 500 });
        // }

        // const dbPlaylistData = dbUserPlaylistData.data.playlists[0] as MongoPlaylistData;
        // debugLog("API: PLAYLIST PUT - dbUserPlaylistData: ", dbPlaylistData);

        //get new recommendations and add them to the playlist
        // if (newSongSettings && preferences && seeds) {
        //     //settings changed, regenerate and save settings while ignoring the old tracks
        // const update = await regeneratePlaylist(
        //         {
        //             playlist_id,
        //             preferences,
        //             seeds,
        //             rules,
        //             trackHistory: dbPlaylistData.trackHistory,
        //         } as PlaylistData,
        //         accessToken,
        //         true
        //     );

        //     if (update.error) {
        //         const { message, status } = update.error;
        //         return NextResponse.json({ message }, { status });
        //     }

        //     const dbSuccess = await dbUpdatePlaylist(userId, {
        //         playlist_id,
        //         preferences,
        //         seeds,
        //         rules,
        //         trackHistory: update.data.newTrackHistory,
        //     });

        //     if (!dbSuccess) {
        //         console.error("Failed to save updated Playlist Data");
        //         return NextResponse.json({ message: "Failed to save updated Playlist Data" }, { status: 500 });
        //     }
        // } else if (!newSongSettings) {
        //     // only run another generation with setting from db
        //     const update = await regeneratePlaylist(
        //         dbUserPlaylistData.data.playlists[0] as MongoPlaylistData,
        //         accessToken,
        //         false
        //     );

        //     if (update.error) {
        //         const { message, status } = update.error;
        //         return NextResponse.json({ message }, { status });
        //     }

        //     //TODO: fidelity: save all tracks to history with date and settingshash, so versions can be shown in frontend
        //     const dbSuccess = await dbUpdatePlaylist(userId, {
        //         playlist_id,
        //         trackHistory: update.data.newTrackHistory,
        //     });

        //     if (!dbSuccess) {
        //         console.error("Failed to save updated Playlist Data");
        //     }

        //     revalidateTag("playlists");
        // } else {
        //     return NextResponse.json(
        //         { message: "To regenerate a Playlist with new Settings, you must provide those new settings" },
        //         { status: 418 }
        //     );
        // }

        if (newSongSettings && preferences && seeds) {
            //update the playlist details on spotify
            const preferencesBody = {
                name: preferences.name,
                description: createPlaylistDescription(preferences, seeds, rules),
                public: false,
            };

            const updatePlaylistDetails = await spotifyPut(
                `https://api.spotify.com/v1/playlists/${playlist_id}`,
                accessToken,
                preferencesBody
            );

            if (updatePlaylistDetails.error) {
                const { message, status } = updatePlaylistDetails.error;
                console.error("Problem updating Playlist details.\n" + message, status);
            }

            //save changes to the database
            const dbSuccess = await dbUpdatePlaylist(userId, {
                playlist_id,
                preferences,
                seeds,
                rules,
            });

            if (!dbSuccess) {
                console.error("Failed to save updated Playlist Data");
                return NextResponse.json({ message: "Failed to save updated Playlist Data" }, { status: 500 });
            }
        }

        revalidateTag("playlists");
        return NextResponse.json(
            {
                message:
                    "Your Playlist would've been regenerated, if Spotify wouldn't have shut down their API ⛓️‍💥😔",
            },
            { status: 500 }
        );
    } catch (error: any) {
        console.error("Failed to update Playlist", error);
        return NextResponse.json({ message: "Failed to update Playlist" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
    try {
        setDebugMode(false);

        debugLog("API: PLAYLIST PATCH - updating playlist");

        const token = await getToken({ req });

        if (!token) {
            console.error("API: PLAYLIST PATCH - No token found");
            return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
        }

        const { accessToken, userId } = token;

        const rawData = await req.json();

        let playlist_id: string | undefined;

        if (rawData.playlist_id && typeof rawData.playlist_id === "string") {
            playlist_id = sanitizeString(rawData.playlist_id, "id");
        }

        if (!playlist_id) {
            return NextResponse.json({ message: "No Playlist ID provided" }, { status: 400 });
        }

        const validation = sanitizeAndValidatePreferences(rawData.preferences);

        if (!validation.valid || !validation.data) {
            return NextResponse.json(
                { errors: validation.error ? validation.error : "Something went wrong" },
                { status: 400 }
            );
        }

        const preferences = validation.data;

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
                console.error("API: PLAYLIST PATCH - Failed to update Cover Image: ", error);
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

        revalidateTag("playlists");

        return NextResponse.json(playlist_id, { status: 200 });
    } catch (error: any) {
        console.error("API: PLAYLIST PATCH - Failed to update Playlist", error);
        return NextResponse.json({ message: "Failed to update Playlist" }, { status: 500 });
    }
}

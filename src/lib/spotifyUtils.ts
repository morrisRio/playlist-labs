import formatter from "numbuffix";
import { Seed, Rule, Preferences, Track, Artist, MongoPlaylistData, PlaylistData } from "@/types/spotify";
import { allRules } from "@/lib/spotifyConstants";
import { spotifyGet, spotifyPost, spotifyPut } from "@/lib/serverUtils";
import { ErrorRes } from "@/types/spotify";
import { debugLog, setDebugMode } from "@/lib/utils";
import { dbGetOneUserPlaylist, dbUpdatePlaylist } from "./db/dbActions";
import { revalidateTag } from "next/cache";

interface RegenError extends ErrorRes {
    data: null;
}

export type regenerateRes = { data: PlaylistData; error: null } | RegenError;

export const regeneratePlaylist = async (
    playlistData: MongoPlaylistData | PlaylistData,
    accessToken: string,
    userId: string,
    newSettings?: boolean
): Promise<regenerateRes> => {
    let { playlist_id, preferences, seeds, rules, trackHistory } = playlistData;

    if (!preferences || !seeds || !playlist_id) {
        console.error("Missing data for playlist regeneration");
        return { data: null, error: { message: "Missing data for playlist regeneration", status: 500 } };
    }

    debugLog("regenerating Playlist" + preferences.name);

    //check if the playlist exists, could be deleted by user (spotify handles deleting by unfollowing)
    const exists = await spotifyGet(
        `https://api.spotify.com/v1/playlists/${playlist_id}/followers/contains`,
        accessToken
    );
    debugLog("-checked if playlist exists", exists);
    //if the playlist does not exist, follow the old one again
    if (!exists[0]) {
        const followRes = await spotifyPut(
            `https://api.spotify.com/v1/playlists/${playlist_id}/followers`,
            accessToken,
            { public: false }
        );
        if (followRes.error) {
            const { status } = followRes.error;
            console.error("API: Failed to follow Playlist", followRes.error);
            return { data: null, error: { message: "Seems like the Playlist doesn't exist anymore", status } };
        }
    }

    //flush the playlist
    debugLog(" - flushing the playlist");
    const flushRes = await spotifyPut(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, accessToken, {
        uris: [],
    });

    if (flushRes.error) {
        const { message, status } = flushRes.error;
        console.error("Problem flushing Playlist.\n" + message, status);
    }

    let trackIdsToAdd: string[] | ErrorRes = [];
    //TODO: fidelity: could: add a toogle in preferences to allow old tracks
    //FOR NOW: always get new tracks
    if (newSettings) {
        //update the description with new settings
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
    }

    // preparation for allowing old tracks
    //if the settings are still the same and we want to aknowldge the history we need the db entry
    //if we dont have the db entry we need to get it
    // let trackHistory: string[];
    // if (!newSettings && playlistData.trackHistory !== undefined) {
    //     const dbUserPlaylistData = await dbGetOneUserPlaylist(userId, playlist_id);
    //     if (dbUserPlaylistData.error || !dbUserPlaylistData.data || dbUserPlaylistData.data.playlists.length === 0) {
    //         console.error("Failed to get Playlist Data from DB", dbUserPlaylistData.error);
    //         return { data: null, error: { message: "Failed to get Playlist Data from DB", status: 404 } };
    //     }
    //     trackHistory = dbUserPlaylistData.data.playlists[0].trackHistory;
    // } else {
    //     trackHistory = playlistData.trackHistory!;
    // }
    //     if (playlistData.trackHistory) playlistData.trackHistory = [];
    //     trackIdsToAdd = await getRecommendations(accessToken, preferences.amount, seeds, rules);
    // } else {
    //     trackIdsToAdd = await getOnlyNewRecommendations(accessToken, preferences.amount, seeds, rules, trackHistory);
    // }

    if (!trackHistory) trackHistory = [];
    trackIdsToAdd = await getOnlyNewRecommendations(accessToken, preferences.amount, seeds, rules, trackHistory);

    //double failsafe
    if ("error" in trackIdsToAdd) {
        console.error("Failed to get only new Tracks", trackIdsToAdd.error);
        console.error("trying simple recommandations instead");

        const recommandationIds = await getRecommendations(accessToken, preferences.amount, seeds, rules);

        if ("error" in recommandationIds) {
            console.error("Failed to get Recommendations", recommandationIds.error);
            const { status } = recommandationIds.error;
            return { data: null, error: { message: "Failed to get Recommendations", status } };
        }
        trackIdsToAdd = recommandationIds;
    }

    //add the tracks to the playlist
    const recommandationQuery = trackIdsToQuery(trackIdsToAdd);

    const addBody = {
        uris: recommandationQuery,
    };

    const addRes = await spotifyPost(
        `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
        accessToken,
        addBody,
        undefined
    );

    if (addRes.error) {
        const { message, status } = addRes.error;
        console.error("Failed to add Recommendations", addRes.error);
        return { data: null, error: { message: "Failed to add Recommendations" + message, status } };
    }

    //TODO: fidelity: save all tracks to history with date and settingshash, so versions can be shown in frontend
    // const dbSuccess = await dbUpdatePlaylist(userId, {
    //     playlist_id,
    //     preferences,
    //     seeds,
    //     rules,
    //     trackHistory: [...trackHistory, ...trackIdsToAdd],
    // });

    // if (!dbSuccess) {
    //     console.error("Failed to save updated Playlist Data");
    // }

    if (newSettings) revalidateTag("playlists");
    return {
        data: { playlist_id, preferences, seeds, rules, trackHistory: [...trackHistory, ...trackIdsToAdd] },
        error: null,
    };
};

/**
 * Generates a description for a given item (Track or Artist).
 *
 * @param {Track | Artist} item - The item for which the description is generated.
 * @returns {string} - The generated description of the item.
 * */
export const getItemDescription = (item: Track | Artist) => {
    if (item.type === "artist" && "genres" in item) {
        return `${formatter(item.followers.total, "")} followers`;
    } else if ("artists" in item) {
        return item.artists.map((artist) => artist.name).join(", ");
    } else {
        return item.type;
    }
};

/**
 * Converts an array of Artist or Track items into an array of Seed objects.
 *
 * @param {Artist[] | Track[]} items - The array of Artist or Track items to convert.
 * @returns {Seed[]} - The array of Seed objects.
 *
 * This function maps over the provided items, creating a new Seed object for each item.
 * It uses helper functions `getItemDescription` and `getThumbnail` to generate the
 * description and thumbnail URL for each Seed.
 */
export const getSeedsFromItems = (items: Artist[] | Track[]): Seed[] => {
    const seeds = items.map((item) => {
        const seed: Seed = {
            spotify: item.external_urls.spotify,
            id: item.id,
            title: item.name,
            description: getItemDescription(item),
            type: item.type,
            thumbnail: getThumbnail(item),
        };
        return seed;
    });
    return seeds;
};

/**
 * Retrieves the thumbnail URL from an Artist or Track item.
 *
 * @param {Artist | Track} item - The item from which to extract the thumbnail URL.
 * @returns {string} - The URL of the thumbnail image.
 */
export const getThumbnail = (item: Artist | Track): string => {
    let thumbnail = "";
    if (item.type === "artist" && "images" in item) {
        thumbnail = item.images[1] && item.images[1].url ? item.images[1].url : "";
    } else if (item.type === "track" && "album" in item) {
        thumbnail = item.album.images[1] && item.album.images[1].url ? item.album.images[1].url : "";
    }
    return thumbnail;
};

/**
 * Fetches track recommendations from the Spotify API based on provided preferences, seeds, and rules.
 *
 * @param {string} accessToken - The access token for authenticating with the Spotify API.
 * @param {Preferences} preferences - The user's preferences, including the number of recommendations to fetch.
 * @param {Seed[]} seeds - An array of Seed objects used to generate recommendations.
 * @param {Rule[]} [rules] - Optional rules to refine the recommendations.
 * @returns {Promise<string[]>} - A promise that resolves to an array of Spotify track ids.
 *
 * This function constructs the query string for the API call from the seeds and rules, makes the API request,
 * and processes the response to extract and return an array of Spotify track URIs.
 */
export const getRecommendations = async (
    accessToken: string,
    amount: number,
    seeds: Seed[],
    rules?: Rule[]
): Promise<string[] | ErrorRes> => {
    try {
        debugLog(" - getting recommendations");
        //create the query string for the api call from the seeds and rules
        const limitQuery = "limit=" + amount;
        const seedQuery = "&" + getSeedQuery(seeds);
        const ruleQuery = rules ? "&" + getRuleQuery(rules) : "";

        const validateTrackRes = (data: any) => {
            if (!data || !data.tracks || !Array.isArray(data.tracks) || data.tracks.length === 0) {
                return { valid: false, message: "Could not get recommandations", status: 500 };
            }
            return { valid: true };
        };

        interface TracksResponse {
            tracks: Track[];
            seeds: Seed[];
        }

        type TrackRes = TracksResponse | ErrorRes;

        const trackRes: TrackRes = await spotifyGet(
            `https://api.spotify.com/v1/recommendations?${limitQuery}${seedQuery}${ruleQuery}`,
            accessToken,
            validateTrackRes
        );

        if ("error" in trackRes) {
            const { message, status } = trackRes.error;
            debugLog("API - error", message);
            return { error: { message, status } };
        }

        // //create the tracksquery
        const tracksToAdd = trackRes.tracks.map((track) => track.id);

        return tracksToAdd;
    } catch (e) {
        console.error("API: Failed to get recommendations", e);
        if (typeof e === "string") return { error: { message: e, status: 500 } };
        return { error: { message: "Failed to get recommendations", status: 500 } };
    }
};

export const trackIdsToQuery = (tracks: string[]): string[] => {
    const query = tracks.map((track) => `spotify:track:${track}`);
    return query;
};

/**
 * Constructs a query string for the Spotify API from an array of rules.
 *
 * @param {Rule[]} rules - An array of rules used to generate the query string.
 * @returns {string} - The constructed query string.
 *
 * This function maps over the provided rules array and constructs individual query parameters based on the rule types:
 * - For array values (axis type), it converts the values to valence and energy targets.
 * - For range type rules with numeric values, it creates target queries.
 * - For boolean type rules, it creates target queries.
 * The resulting query parameters are then joined with '&' to form the final query string.
 */
const getRuleQuery = (rules: Rule[]): string => {
    const ruleQuery = rules
        .map((rule) => {
            if (Array.isArray(rule.value)) {
                return `target_valence=${1 - rule.value[1] / 100}&target_energy=${rule.value[0] / 100}`;
            } else if (rule.type === "range" && typeof rule.value === "number") {
                if (rule.name === "Tempo") return `target_${rule.name.toLowerCase()}=${rule.value}`;
                return `target_${rule.name.toLowerCase()}=${rule.value / 100}`;
            } else if (rule.type === "boolean" && typeof rule.value === "boolean") {
                return `target_${rule.name.toLowerCase()}=${rule.value}`;
            }
        })
        .join("&");
    debugLog("RULE_QUERY: ", ruleQuery);
    return ruleQuery;
};

/**
 * Generates a query string based on the provided seed objects.
 *
 * @param seeds - An array of seed objects.
 * @returns The generated seed query string.
 */
const getSeedQuery = (seeds: Seed[]) => {
    const seedArtists = seeds.filter((seed) => seed.type === "artist");
    const seedGenres = seeds.filter((seed) => seed.type === "genre");
    const seedTracks = seeds.filter((seed) => seed.type === "track");

    const seedArtistsQuery =
        seedArtists.length > 0 ? "seed_artists=" + seedArtists.map((seed) => seed.id).join(",") : "";
    const seedGenresQuery =
        seedGenres.length > 0 ? "seed_genres=" + seedGenres.map((seed) => seed.id.toLowerCase()).join(",") : "";
    const seedTracksQuery = seedTracks.length > 0 ? "seed_tracks=" + seedTracks.map((seed) => seed.id).join(",") : "";

    const seedQuery = [seedArtistsQuery, seedGenresQuery, seedTracksQuery].filter((seed) => seed !== "").join("&");
    return seedQuery;
};

interface MongoRule {
    name: string;
    value: number | boolean | number[];
}

/* takes the answer from MongoDB an populates it with fields for frontend*/
/**
 * Transforms an array of MongoRule objects into an array of Rule objects by matching the rule names.
 * @param rules - An array of MongoRule objects.
 * @returns An array of Rule objects with matched rule names and corresponding values.
 */
export const completeRules = (rules: MongoRule[]): Rule[] => {
    setDebugMode(true);
    if (rules.length === 0) {
        debugLog("returning empty rules array");
        return [] as Rule[];
    }
    debugLog("Completing Rules");
    //match the rule
    return rules.map((rule) => {
        const completeRule = allRules.find((r) => r.name === rule.name);
        if (!completeRule) {
            return {} as Rule;
        }
        return {
            ...completeRule,
            value: rule.value,
        } as Rule;
    });
};

/**
 * Creates a playlist description based on the given preferences, seeds, and rules.
 * @param preferences - The preferences for the playlist.
 * @param seeds - The seeds for the playlist.
 * @param rules - The rules for the playlist (optional).
 * @returns The playlist description.
 */
export const createPlaylistDescription = (preferences: Preferences, seeds: Seed[], rules: Rule[] | undefined) => {
    try {
        const preferencesDescription = `${
            preferences.frequency[0].toUpperCase() + preferences.frequency.slice(1)
        } updates`;

        /**
         * Gets the description for the seed section of the playlist.
         * @param seeds - The seeds for the playlist.
         * @returns The seed description.
         */
        const getSeedDescription = (seeds: Seed[]) => {
            let trackSeeds = seeds.filter((seed) => seed.type === "track").map((seed) => seed.title);
            let artistSeeds = seeds.filter((seed) => seed.type === "artist").map((seed) => seed.title);
            let genreSeeds = seeds.filter((seed) => seed.type === "genre").map((seed) => seed.title);

            const seedStrings = [...trackSeeds, ...artistSeeds, ...genreSeeds];

            if (seedStrings.length === 1) {
                return ` based on ${seedStrings.join(" and ")}`;
            }
            const lastSeed = seedStrings.pop();
            const seedDescription = ` based on ${seedStrings.join(", ")} and ${lastSeed}`;

            return seedDescription;
        };

        /**
         * Gets the description for the rule section of the playlist.
         * @param rules - The rules for the playlist.
         * @returns The rule description.
         */
        const getRuleDescription = (rules: Rule[] | undefined) => {
            if (!rules || rules.length === 0 || !Array.isArray(rules)) {
                return "";
            }

            const getRangeDescription = (value: number): string => {
                if (value < 16) return "very low";
                if (value < 32) return "low";
                if (value < 66) return "medium";
                if (value < 82) return "high";
                return "very high";
            };

            const getMoodDescription = (value: number): string => {
                if (value < 16) return "very negative";
                if (value < 32) return "negative";
                if (value < 66) return "neutral";
                if (value < 82) return "positive";
                return "euphoric";
            };

            const ruleStrings = rules.map((rule) => {
                switch (rule.type) {
                    case "range":
                        return `${getRangeDescription(rule.value as number)} ${rule.name.toLowerCase()}`;
                    case "boolean":
                        if (typeof rule.range[+rule.value as number] !== "string") return "";
                        //turning boolean into a number with "+" and then using it as an index for the range array
                        const string = `${rule.range![+rule.value as number]} ${rule.name}`;
                        return string.toLowerCase();
                    case "axis":
                        const [rangeValue, moodValue] = rule.value as [number, number];
                        return `${getMoodDescription(100 - moodValue)} feelings in ${getRangeDescription(
                            rangeValue
                        )} intensity`;
                    default:
                        return "";
                }
            });

            if (ruleStrings.length === 1) {
                debugLog("ruleStrings", ruleStrings);
                return `. Aiming for ${ruleStrings[0]}`;
            }

            //if there are multiple rules, join them with commas and add "and" before the last rule
            const lastRule = ruleStrings.pop();
            const ruleDescription = `. Aiming for ${ruleStrings.join(", ")} and ${lastRule}`;

            debugLog("ruleDescription", ruleDescription);
            return ruleDescription;
        };

        const description = `Playlist created by playlistLabs. ${
            preferencesDescription + getSeedDescription(seeds) + getRuleDescription(rules)
        }`;
        debugLog("Finished Description: ", description);
        return description;
    } catch (e) {
        console.error("Failed to create Playlist Description", e);
        return "Playlist created by playlistLabs";
    }
};

export const getOnlyNewRecommendations = async (
    accessToken: string,
    amount: number,
    seeds: Seed[],
    rules: Rule[] | undefined,
    trackHistory: string[]
): Promise<string[] | ErrorRes> => {
    try {
        debugLog("Ensuring new tracks");

        const recommandationIds = await getRecommendations(accessToken, 50, seeds, rules);
        if ("error" in recommandationIds) {
            throw new Error(recommandationIds.error.message);
        }

        let newTracks = recommandationIds.filter((track) => !trackHistory.includes(track));
        let loops = 0;

        // Loop to fetch new recommendations if needed
        while (newTracks.length < amount) {
            if (loops < 3) {
                // Get 50 new recommendations
                debugLog(`Loop ${loops + 1}:  ${newTracks.length} tracks -> Fetching more recommendations`);
                const newRecs = await getRecommendations(accessToken, 50, seeds, rules);
                if ("error" in newRecs) {
                    console.error("Error getting Recommendations in loop:", newRecs.error.message);
                    newTracks = [...newTracks, ...getRandomTrackIds(trackHistory, amount - newTracks.length)];
                    break;
                }
                newTracks = filterNewTracks(newRecs, trackHistory, newTracks);
            } else if (loops < 6) {
                debugLog(`Loop ${loops + 1}:  ${newTracks.length} tracks -> Fetching with one random Seed`);
                // Get 50 new recommendations with one random added seed from trackHistory
                const randomSeed = seedFromId(getRandomTrackIds(trackHistory, 1)[0]);
                const updatedSeeds = fillSeeds(seeds, [randomSeed]);
                const newRecs = await getRecommendations(accessToken, 50, updatedSeeds, rules);
                if ("error" in newRecs) {
                    console.error("Error getting Recommendations in loop:", newRecs.error.message);
                    newTracks = [...newTracks, ...getRandomTrackIds(trackHistory, amount - newTracks.length)];
                    break;
                }
                newTracks = filterNewTracks(newRecs, trackHistory, newTracks);
            } else if (loops < 10) {
                debugLog(`Loop ${loops + 1}: ${newTracks.length} tracks -> Fetching with two random Seeds`);
                // Get 50 new recommendations with two random seeds from trackHistory
                const randomSeeds = getRandomTrackIds(trackHistory, 2).map((trackId) => seedFromId(trackId));
                const updatedSeeds = fillSeeds(seeds, randomSeeds);
                debugLog("new seeds: ", randomSeeds);
                const newRecs = await getRecommendations(accessToken, 50, updatedSeeds, rules);
                if ("error" in newRecs) {
                    console.error("Error getting Recommendations in loop:", newRecs.error.message);
                    newTracks = [...newTracks, ...getRandomTrackIds(trackHistory, amount - newTracks.length)];
                    break;
                }
                newTracks = filterNewTracks(newRecs, trackHistory, newTracks);
            } else {
                debugLog(`Loop ${loops + 1}: ${newTracks.length} tracks -> giving up, fill with random from history`);
                // Fill the missing amount with random seeds from the trackHistory after 10 loops
                const randomSeeds = getRandomTrackIds(trackHistory, amount - newTracks.length);
                newTracks = [...newTracks, ...randomSeeds];
                break;
            }
            loops++;
        }
        const tracksToAdd = newTracks.slice(0, amount);
        debugLog("Final new tracks", tracksToAdd.length);
        return tracksToAdd;
        //TODO: last resort to vary rules
    } catch (e) {
        console.error("API: Failed to get recommendations", e);
        if (typeof e === "string") return { error: { message: e, status: 500 } };
        return { error: { message: "Failed to get recommendations", status: 500 } };
    }
};

// Helper functions

// Get random tracks from the trackHistory
const getRandomTrackIds = (trackHistory: string[], count: number): string[] => {
    const trackCount = Math.min(count, trackHistory.length); // Ensure we don't request more than available
    const randomIndices = new Set<number>();
    var loops = 0;
    while (randomIndices.size < trackCount) {
        const randomIndex = Math.floor(Math.random() * trackHistory.length);
        randomIndices.add(randomIndex);
        loops++;
        if (loops > 100) break; // Break after 100 loops to avoid infinite loop
    }

    return Array.from(randomIndices).map((index) => trackHistory[index]);
};

// // Vary the rules for generating recommendations
// const varyRules = (rules: Rule[]): Rule[] => {
//     // Implementation for varying the rules to get different recommendations
// };

// Filter out tracks already in the history and add only new tracks
const filterNewTracks = (recommendations: string[], trackHistory: string[], currentTracks: string[]): string[] => {
    const filteredTracks = recommendations.filter(
        (track) => !trackHistory.includes(track) && !currentTracks.includes(track)
    );
    return [...currentTracks, ...filteredTracks];
};

const seedFromId = (trackId: string) => {
    return {
        spotify: "filled up by random seed",
        id: trackId,
        title: "filled up by random seed",
        description: "filled up by random seed",
        type: "track",
        thumbnail: "filled up by random seed",
    };
};

const fillSeeds = (seeds: Seed[], newSeeds: Seed[]): Seed[] => {
    const maxLength = 5;
    // If the original seeds already exceed or meet the target length, replace the last elements with newSeeds
    if (seeds.length + newSeeds.length >= maxLength) {
        const seedsToReplace = Math.min(newSeeds.length, maxLength);
        return [...seeds.slice(0, maxLength - seedsToReplace), ...newSeeds.slice(0, seedsToReplace)];
    }
    // Calculate how many seeds are needed to reach the target length
    const seedsNeeded = Math.min(maxLength - seeds.length, newSeeds.length);
    // Combine the original seeds with the needed amount of new seeds
    return [...seeds, ...newSeeds.slice(0, seedsNeeded)];
};

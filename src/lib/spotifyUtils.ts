import formatter from "numbuffix";
import { Seed, Rule, Preferences, Track, Artist } from "@/types/spotify";
import { allRules } from "@/lib/spotifyConstants";
import { spotifyGet, spotifyPost } from "@/lib/serverUtils";
import { debugLog, setDebugMode } from "@/lib/logger";

/**
 * Generates a description for a given item (Track or Artist).
 *
 * @param {Track | Artist} item - The item for which the description is generated.
 * @returns {string} - The generated description of the item.
 * */
export const getItemDescription = (item: Track | Artist) => {
    setDebugMode(false);
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

type TracksResponse = {
    tracks: Track[];
    seeds: Seed[];
};

/**
 * Fetches track recommendations from the Spotify API based on provided preferences, seeds, and rules.
 *
 * @param {string} accessToken - The access token for authenticating with the Spotify API.
 * @param {Preferences} preferences - The user's preferences, including the number of recommendations to fetch.
 * @param {Seed[]} seeds - An array of Seed objects used to generate recommendations.
 * @param {Rule[]} [rules] - Optional rules to refine the recommendations.
 * @returns {Promise<string[]>} - A promise that resolves to an array of Spotify track URIs.
 *
 * This function constructs the query string for the API call from the seeds and rules, makes the API request,
 * and processes the response to extract and return an array of Spotify track URIs.
 */
export const getRecommendations = async (
    accessToken: string,
    preferences: Preferences,
    seeds: Seed[],
    rules?: Rule[]
): Promise<string[]> => {
    setDebugMode(false);
    debugLog(" - getting recommendations");
    //create the query string for the api call from the seeds and rules
    const limitQuery = "limit=" + preferences.amount;
    const seedQuery = "&" + getSeedQuery(seeds);
    const ruleQuery = rules ? "&" + getRuleQuery(rules) : "";

    const trackRes = (await spotifyGet(
        `https://api.spotify.com/v1/recommendations?${limitQuery}${seedQuery}${ruleQuery}`,
        accessToken
    )) as TracksResponse;

    //create the tracksquery
    const tracksToAdd = trackRes.tracks.map((track) => `spotify:track:${track.id}`);

    console.info(` -> got ${tracksToAdd.length} recommendations`);
    return tracksToAdd;
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
    setDebugMode(false);
    const ruleQuery = rules
        .map((rule) => {
            if (Array.isArray(rule.value)) {
                //this might be flipped
                return `target_valence=${1 - rule.value[1] / 100}&target_energy=${rule.value[0] / 100}`;
            } else if (rule.type === "range" && typeof rule.value === "number") {
                return `target_${rule.name}=${rule.value / 100}`;
            } else if (rule.type === "boolean" && typeof rule.value === "boolean") {
                return `target_${rule.name}=${rule.value}`;
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
    const seedGenresQuery = seedGenres.length > 0 ? "seed_genres=" + seedGenres.map((seed) => seed.id).join(",") : "";
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
    //match the rule
    const completeRules = rules.map((rule) => {
        const completeRule = allRules.find((r) => r.name === rule.name);
        if (!completeRule) {
            return {} as Rule;
        }
        return {
            ...completeRule,
            value: rule.value,
        } as Rule;
    });

    return completeRules;
};

/**
 * Creates a playlist description based on the given preferences, seeds, and rules.
 * @param preferences - The preferences for the playlist.
 * @param seeds - The seeds for the playlist.
 * @param rules - The rules for the playlist (optional).
 * @returns The playlist description.
 */
export const createPlaylistDescription = (preferences: Preferences, seeds: Seed[], rules: Rule[] | undefined) => {
    const preferencesDescription = `${preferences.frequency[0].toUpperCase() + preferences.frequency.slice(1)} updates`;

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
        setDebugMode(false);

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
};

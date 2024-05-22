import formatter from "numbuffix";
import { Seed, Rule, Preferences, Track, PlaylistData } from "@/types/spotify";
import { allRules } from "@/lib/spotifyConstants";
import { spotifyGet, spotifyPost } from "@/lib/serverUtils";

//CREATE ==============================================================================

//GET =================================================================================

export const getDescription = (item: any) => {
    if (item.type === "artist") {
        return `${item.genres.join(", ")} · ${formatter(
            item.followers.total,
            ""
        )} followers`;
    } else {
        // @ts-ignore
        return item.artists.map((artist) => artist.name).join(", ");
    }
};

//TODO: add type from spotify response
export const getSeedsFromItems = (items: any[]): Seed[] => {
    const seeds = items.map((item: any) => {
        if (item.type === "genre") {
            const seed: Seed = {
                spotify: "todo: find genre links",
                id: item.title,
                title: item.title,
                description: item.type,
                type: item.type,
                thumbnail: "",
            };
            return seed;
        }

        const seed: Seed = {
            spotify: item.external_urls.spotify,
            id: item.id,
            title: item.name,
            description: getDescription(item),
            type: item.type,
            thumbnail: getThumbnail(item),
        };
        return seed;
    });
    return seeds;
};

export const getThumbnail = (item: any): string => {
    let thumbnail = "";
    if (item.type === "artist") {
        thumbnail =
            item.images[1] && item.images[1].url ? item.images[1].url : "";
    } else if (item.type === "track") {
        thumbnail =
            item.album.images[1] && item.album.images[1].url
                ? item.album.images[1].url
                : "";
    }
    //genre
    //TODO: add custom genre thumbnail
    return thumbnail;
};

type TracksResponse = {
    tracks: Track[];
    seeds: Seed[];
};

/* get recommendations from the spotify api and turn them into an array of strings that can be used to add them to a playlist*/
export const getRecommendations = async (
    accessToken: string,
    preferences: Preferences,
    seeds: Seed[],
    rules?: Rule[]
): Promise<string[]> => {
    console.info(" - getting recommendations");
    //create the query string for the api call from the seeds and rules
    const limitQuery = "limit=" + preferences.amount;
    const seedQuery = "&" + getSeedQuery(seeds);
    const ruleQuery = rules ? "&" + getRuleQuery(rules) : "";

    const trackRes: TracksResponse = await spotifyGet(
        `https://api.spotify.com/v1/recommendations?${limitQuery}${seedQuery}${ruleQuery}`,
        accessToken
    );

    //create the tracksquery
    const tracksToAdd = trackRes.tracks.map(
        (track) => `spotify:track:${track.id}`
    );

    console.info(` -> got ${tracksToAdd.length} recommendations`);
    return tracksToAdd;
};

const getRuleQuery = (rules: Rule[]) => {
    const ruleQuery = rules
        .map((rule) => {
            if (Array.isArray(rule.value)) {
                //this might be flipped
                return `target_valence=${
                    1 - rule.value[1] / 100
                }&target_energy=${rule.value[0] / 100}`;
            } else if (
                rule.type === "range" &&
                typeof rule.value === "number"
            ) {
                return `target_${rule.name}=${rule.value / 100}`;
            } else if (
                rule.type === "boolean" &&
                typeof rule.value === "boolean"
            ) {
                return `target_${rule.name}=${rule.value}`;
            }
        })
        .join("&");
    return ruleQuery;
};

const getSeedQuery = (seeds: Seed[]) => {
    const seedArtists = seeds.filter((seed) => seed.type === "artist");
    const seedGenres = seeds.filter((seed) => seed.type === "genre");
    const seedTracks = seeds.filter((seed) => seed.type === "track");

    const seedArtistsQuery =
        seedArtists.length > 0
            ? "seed_artists=" + seedArtists.map((seed) => seed.id).join(",")
            : "";
    const seedGenresQuery =
        seedGenres.length > 0
            ? "seed_genres=" + seedGenres.map((seed) => seed.id).join(",")
            : "";
    const seedTracksQuery =
        seedTracks.length > 0
            ? "seed_tracks=" + seedTracks.map((seed) => seed.id).join(",")
            : "";

    const seedQuery = [seedArtistsQuery, seedGenresQuery, seedTracksQuery]
        .filter((seed) => seed !== "")
        .join("&");
    return seedQuery;
};

interface MongoRule {
    name: string;
    value: number | boolean | number[];
}

/* takes the answer from MongoDB an populates it with fields for frontend*/
export const completeRules = (rules: MongoRule[]): Rule[] => {
    //TODO: what if the rule is not found?
    //match the rule
    const completeRules = rules.map((rule) => {
        const completeRule = allRules.find((r) => r.name === rule.name);
        return {
            ...completeRule,
            value: rule.value,
        } as Rule;
    });

    return completeRules;
};

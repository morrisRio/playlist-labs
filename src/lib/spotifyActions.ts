import formatter from "numbuffix";
import { Seed, Rule } from "@/types/spotify";
import { allRules } from "@/lib/spotifyConstants";
import { MongoRule } from "@/types/db";

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
//TODO: add type from spotify response
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
    return thumbnail;
};

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

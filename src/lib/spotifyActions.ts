import formatter from "numbuffix";
import { Seed } from "@/types/spotify";

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

export const getThumbnail = (item: any) => {
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

export const genres: string[] = [
    "acoustic",
    "afrobeat",
    "alt-rock",
    "alternative",
    "ambient",
    "anime",
    "black-metal",
    "bluegrass",
    "blues",
    "bossanova",
    "brazil",
    "breakbeat",
    "british",
    "cantopop",
    "chicago-house",
    "children",
    "chill",
    "classical",
    "club",
    "comedy",
    "country",
    "dance",
    "dancehall",
    "death-metal",
    "deep-house",
    "detroit-techno",
    "disco",
    "disney",
    "drum-and-bass",
    "dub",
    "dubstep",
    "edm",
    "electro",
    "electronic",
    "emo",
    "folk",
    "forro",
    "french",
    "funk",
    "garage",
    "german",
    "gospel",
    "goth",
    "grindcore",
    "groove",
    "grunge",
    "guitar",
    "happy",
    "hard-rock",
    "hardcore",
    "hardstyle",
    "heavy-metal",
    "hip-hop",
    "holidays",
    "honky-tonk",
    "house",
    "idm",
    "indian",
    "indie",
    "indie-pop",
    "industrial",
    "iranian",
    "j-dance",
    "j-idol",
    "j-pop",
    "j-rock",
    "jazz",
    "k-pop",
    "kids",
    "latin",
    "latino",
    "malay",
    "mandopop",
    "metal",
    "metal-misc",
    "metalcore",
    "minimal-techno",
    "movies",
    "mpb",
    "new-age",
    "new-release",
    "opera",
    "pagode",
    "party",
    "philippines-opm",
    "piano",
    "pop",
    "pop-film",
    "post-dubstep",
    "power-pop",
    "progressive-house",
    "psych-rock",
    "punk",
    "punk-rock",
    "r-n-b",
    "rainy-day",
    "reggae",
    "reggaeton",
    "road-trip",
    "rock",
    "rock-n-roll",
    "rockabilly",
    "romance",
    "sad",
    "salsa",
    "samba",
    "sertanejo",
    "show-tunes",
    "singer-songwriter",
    "ska",
    "sleep",
    "songwriter",
    "soul",
    "soundtracks",
    "spanish",
    "study",
    "summer",
    "swedish",
    "synth-pop",
    "tango",
    "techno",
    "trance",
    "trip-hop",
    "turkish",
    "work-out",
    "world-music",
];

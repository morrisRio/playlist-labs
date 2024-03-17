import { Playlist, Track } from "@/types/types";
import { customGet, customPost } from "./serverUtils";
import { AuthSession } from "@/types/spotify";

//CREATE ==============================================================================
export const createPlaylist = async (
    playlistName: string,
    description: string
): Promise<Playlist> => {
    const body = {
        name: playlistName,
        description: description,
        public: false,
    };

    //TODO: get userId from session
    const data = await customPost(
        `https://api.spotify.com/v1/users/karate_morris/playlists`,
        body
    );
    console.log("Playlist created: ", data);
    return data;
};

//GET =================================================================================
export const getUserPlaylist = async (
    session: AuthSession
): Promise<Playlist[]> => {
    const data = await customGet(
        `https://api.spotify.com/v1/me/playlists`,
        session
    );
    return data.items;
};

type LikedSongs = { total: number; items: Track[] };

export const getUserLikedSongs = async (
    session: AuthSession
): Promise<LikedSongs> => {
    const data = await customGet(
        `https://api.spotify.com/v1/me/tracks?limit=50`,
        session
    );

    const finalData = { total: data.total, items: data.items };
    let limit = 50;
    let currUrl = data.next;

    while (currUrl !== null) {
        const nextData = await customGet(currUrl, session);
        finalData.items.push(...nextData.items);
        limit += 50;
        currUrl = nextData.next;
    }

    return {
        total: data.total,
        items: data.items.map((item: any) => item.track),
    };
};

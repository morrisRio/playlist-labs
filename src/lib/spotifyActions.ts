import { Playlist } from "@/types/types";
import { customGet } from "./serverUtils";
import { AuthSession } from "@/types/types";

export const getUserPlaylist = async (
    session: AuthSession
): Promise<Playlist[]> => {
    const data = await customGet(
        `https://api.spotify.com/v1/me/playlists`,
        session
    );
    return data.items;
};

import { PlaylistData } from "@/types/spotify";
import { headers } from "next/headers";
import Link from "next/link";

interface PlaylistProps {
    playlist: PlaylistData;
}

/*
    how do i get the playlist data in here without fetching it again
    from the db when it is accesed through the home page but get the data 
    when it is accessed a link to the playlist page in the description?
*/

//create a store for the playlists and get data from the store for playlist id when the store exists
//if the store does not exist fetch the data from the db and create a store for the playlists

async function PlaylistEntry({ playlist }: PlaylistProps) {
    const { playlist_id } = playlist;
    const { name: playlist_name } = playlist.preferences;

    const { url } = await fetch(
        process.env.NEXTAUTH_URL + `/api/spotify/playlist/cover-image?playlist_id=${playlist_id}`,
        {
            method: "GET",
            headers: new Headers(headers()),
            next: { tags: ["playlist"] },
        }
    ).then((res) => res.json());

    return (
        <Link href={`/pages/edit-playlist/${playlist_id}`}>
            <div className=" flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                <img src={url} alt="playlist cover image" className="size-20 bg-ui-800 rounded-l-lg" />
                <h4>{playlist_name}</h4>
            </div>
        </Link>
    );
}

export default PlaylistEntry;

import { PlaylistData } from "@/types/spotify";
import { headers } from "next/headers";
import Link from "next/link";

interface PlaylistProps {
    playlist: PlaylistData;
}

async function PlaylistEntry({ playlist }: PlaylistProps) {
    const { playlist_id } = playlist;
    const { name: playlist_name } = playlist.preferences;

    const url = await fetch(process.env.NEXTAUTH_URL + `/api/spotify/playlist/cover-image?playlist_id=${playlist_id}`, {
        method: "GET",
        headers: new Headers(headers()),
        next: { tags: ["playlist"] },
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const { message } = data;
                throw new Error("Network response was not ok " + res.status + " " + message);
            }
            return data;
        })
        .catch((error) => {
            console.log("Error on Server Component:", error);
            return false;
        });

    return (
        <Link href={`/pages/edit-playlist/${playlist_id}`}>
            <div className=" flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                {url && <img src={url} alt="playlist cover image" className="size-20 bg-ui-800 rounded-l-lg" />}
                {!url && <div className="size-20 bg-ui-800 rounded-l-lg"></div>}
                <h4>{playlist_name}</h4>
            </div>
        </Link>
    );
}

export default PlaylistEntry;

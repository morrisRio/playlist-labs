import { auth } from "@/lib/serverUtils";
import { PlaylistData } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { dbGetOnePlaylist } from "@/lib/db/dbActions";
import { headers } from "next/headers";
import { getAppUrl } from "@/lib/utils";
import { redirect } from "next/navigation";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;

    const session = await auth("playlist");
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }

    let playlist: PlaylistData | null = null;

    const getCoverUrl = async (playlist_id: string): Promise<string | undefined> => {
        const coverUrl = await fetch(getAppUrl() + `/api/spotify/playlist/cover/${playlist_id}`, {
            method: "GET",
            headers: new Headers(headers()),
            next: { tags: ["playlist"] },
        })
            .then(async (res) => {
                const url = await res.json();
                if (!res.ok) {
                    const { message } = url;
                    throw new Error("Network response was not ok " + res.status + " " + message);
                }
                return url as string;
            })
            .catch((error) => {
                console.log("Error on Server Component:", error);
                return undefined;
            });
        return coverUrl;
    };

    if (session && session.user && session.user.id) {
        playlist = await dbGetOnePlaylist(session.user.id, playlist_id)
            .then(async (playlist) => {
                if (playlist && playlist.playlist_id) playlist.coverUrl = await getCoverUrl(playlist.playlist_id);
                return playlist;
            })
            .catch((err) => {
                console.error(err);
                return null;
            });
    } else {
        console.error("Session Error: ", session);
        //TODO: error handling
    }

    return (
        <div className="h-full w-full">
            {playlist && <PlaylistCreator pageTitle="Edit Playlist" playlist={playlist}></PlaylistCreator>}
        </div>
    );
}

export default EditPlaylist;

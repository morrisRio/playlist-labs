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

    if (session && session.user && session.user.id) {
        playlist = await dbGetOnePlaylist(session.user.id, playlist_id)
            .then(async (playlist) => {
                return playlist;
            })
            .catch((err) => {
                console.error(err);
                return null;
            });
    } else {
        console.error("Session Error: ", session);
        redirect("/api/auth/signin");
    }

    return (
        <div className="h-full w-full">
            {playlist && <PlaylistCreator pageTitle="Edit Playlist" playlist={playlist}></PlaylistCreator>}
        </div>
    );
}

export default EditPlaylist;

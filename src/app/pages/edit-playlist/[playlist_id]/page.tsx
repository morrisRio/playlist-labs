import { auth } from "@/lib/serverUtils";
import { PlaylistData } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { dbGetOnePlaylist } from "@/lib/db/dbActions";
import { redirect } from "next/navigation";
import UniModal from "@/components/UniModal";
import router from "next/router";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;

    const session = await auth("playlist");
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }

    let playlist: PlaylistData | null = null;
    let error = false;
    if (session && session.user && session.user.id) {
        playlist = await dbGetOnePlaylist(session.user.id, playlist_id)
            .then(async (playlist) => {
                // console.log("Playlist: ", playlist);
                return playlist;
            })
            .catch((err) => {
                console.error(err);
                error = true;
                return null;
            });
    } else {
        console.error("Session Error: ", session);
        redirect("/api/auth/signin");
    }

    return (
        <div className="min-h-full min-w-full">
            {error && <p>Something went wrong. We&apos;re Sorry.</p>}
            {playlist && <PlaylistCreator pageTitle="Edit Playlist" playlist={playlist}></PlaylistCreator>}
        </div>
    );
}

export default EditPlaylist;

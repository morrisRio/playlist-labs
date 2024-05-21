import { auth } from "@/lib/serverUtils";
import { PlaylistData } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { dbGetOnePlaylist } from "@/lib/db/dbActions";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;

    const session = await auth();

    let playlist: PlaylistData | null = null;

    if (session && session.user && session.user.id) {
        playlist = await dbGetOnePlaylist(session.user.id, playlist_id);
    } else {
        console.error("Session Error: ", session);
        //TODO: empty state
    }

    return (
        <div>
            {playlist && (
                <PlaylistCreator playlist={playlist}></PlaylistCreator>
            )}
        </div>
    );
}

export default EditPlaylist;

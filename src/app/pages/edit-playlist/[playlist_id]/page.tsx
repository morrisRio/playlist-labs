import { auth } from "@/lib/serverUtils";
import { PlaylistData } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { dbGetOnePlaylist } from "@/lib/db/dbActions";
import { MdChevronLeft } from "react-icons/md";
import Link from "next/link";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;

    const session = await auth("edit");

    let playlist: PlaylistData | null = null;

    if (session && session.user && session.user.id) {
        playlist = await dbGetOnePlaylist(session.user.id, playlist_id);
    } else {
        console.error("Session Error: ", session);
        //TODO: empty state
    }

    return (
        <div className="h-full w-full p-3 flex flex-col gap-4">
            <div className="flex items-center">
                <Link href="/" replace={true}>
                    <MdChevronLeft size="2rem"></MdChevronLeft>
                </Link>
                <h3> Edit Playlist</h3>
            </div>
            {playlist && <PlaylistCreator playlist={playlist}></PlaylistCreator>}
        </div>
    );
}

export default EditPlaylist;

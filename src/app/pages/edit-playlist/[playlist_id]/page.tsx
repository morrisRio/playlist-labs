import { auth } from "@/lib/serverUtils";
import { PlaylistData } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { dbGetOnePlaylist } from "@/lib/db/dbActions";
import { MdChevronLeft } from "react-icons/md";
import Link from "next/link";
import { headers } from "next/headers";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;

    const session = await auth("edit");

    let playlist: PlaylistData | null = null;

    const getCoverUrl = async (playlist_id: string): Promise<string | undefined> => {
        const coverUrl = await fetch(
            process.env.NEXTAUTH_URL + `/api/spotify/playlist/cover-image?playlist_id=${playlist_id}`,
            {
                method: "GET",
                headers: new Headers(headers()),
                next: { tags: ["playlist"] },
            }
        )
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
        <div className="h-full w-full flex flex-col gap-4">
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

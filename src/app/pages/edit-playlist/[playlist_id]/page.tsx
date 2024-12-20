import { redirect } from "next/navigation";

import { auth } from "@/lib/serverUtils";
import { dbGetOnePlaylistData } from "@/lib/db/dbActions";

import { PlaylistData } from "@/types/spotify";

import ClientSessionProvider from "@/components/ClientSessionProvider";
import PlaylistEditor from "@/components/PlaylistCreator/PlaylistEditor";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    const { playlist_id } = params;
    let playlistData: PlaylistData | null = null;

    const session = await auth("playlist");
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }

    const { data, error } = await dbGetOnePlaylistData(session.user.id, playlist_id);
    if (error) playlistData = null;
    else playlistData = data;

    return (
        <div className="h-full w-full flex flex-col">
            {error && (
                <div className="h-screen flex flex-col justify-center items-center gap-5">
                    <p>Something went wrong. We&apos;re Sorry.</p>
                    <a href="/">
                        <button role="navigation" className="px-4 py-2 bg-themetext font-normal text-ui-900 rounded-lg">
                            Back to the Main Page
                        </button>
                    </a>
                </div>
            )}
            {playlistData && (
                <ClientSessionProvider session={session}>
                    <PlaylistEditor pageTitle="Edit Playlist" playlist={playlistData}></PlaylistEditor>
                </ClientSessionProvider>
            )}
        </div>
    );
}

export default EditPlaylist;

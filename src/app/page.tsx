import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Profile";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { PlaylistData } from "@/types/spotify";
import { getUsersPlaylists } from "@/lib/db/dbActions";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import Center from "@/components/Dashboard";

//TODO: typescript
export default async function Home() {
    const session = await getServerSession(authOptions);
    let playlists: PlaylistData[] | false = false;

    //TODO: revalidate route
    if (session && session.user && session.user.id) {
        playlists = await getUsersPlaylists(session.user.id);
    } else {
        console.error("Session Error: ", session);
    }

    return (
        <div className="h-full w-full p-4 flex flex-col gap-8">
            <h1>playlistLabs</h1>
            <Link href="/pages/create-playlist">
                <div className=" flex gap-4 items-center p-2 w-full mb-4 bg-zinc-900/50 border border-zinc-700 rounded-xl">
                    <div className="size-20 bg-zinc-900/50 border border-zinc-700 rounded-md flex items-center justify-center">
                        <MdAdd size="3rem"></MdAdd>
                    </div>
                    <h4>Create New Playlist</h4>
                </div>
            </Link>
            {/* render all playlists found in database for user */}
            {playlists &&
                playlists.map((playlist) => (
                    <PlaylistEntry
                        playlist={playlist}
                        key={playlist.playlist_id?.toString()}
                    />
                ))}
            <Profile></Profile>
        </div>
    );
}

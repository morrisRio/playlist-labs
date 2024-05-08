import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Profile";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { Playlist } from "@/types/spotify";
import { connectMongoDB } from "@/lib/db";
import User from "@/app/api/db/user/userModel";
// import Center from "@/components/Dashboard";

//TODO: typescript
export default async function Home() {
    const playlists = await getPlaylists();
    console.log("Playlists: ", playlists);

    async function getPlaylists(): Promise<Playlist[]> {
        "use server";
        const session = await getServerSession();
        await connectMongoDB();

        const user = await User.findOne({ spotify_id: session?.user?.name });
        console.log("user: ", user);

        const playlists = user.playlists;

        return playlists;
    }

    return (
        <div className="h-full w-full p-4 flex flex-col gap-8">
            <h1>playlistLabs</h1>
            <Link href="/pages/CreatePlaylist">
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
                        key={playlist.playlist_id}
                    />
                ))}
            <Profile></Profile>
        </div>
    );
}

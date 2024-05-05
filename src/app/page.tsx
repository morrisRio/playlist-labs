import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import Profile from "@/components/Profile";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
// import Center from "@/components/Dashboard";

export default async function Home() {
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
        </div>
    );
}

// export const dynamic = "force-dynamic";
//TODO: wait for unstable_cache to be stable to use for revalidation on demand (submit trigger)

import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Profile";
import { auth } from "@/lib/serverUtils";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { PlaylistData } from "@/types/spotify";
import { dbGetUsersPlaylists } from "@/lib/db/dbActions";
import { headers } from "next/headers";

export default async function Home() {
    //TODO: this second call to auth is not necessary
    //it gets called in the layout component
    //but since this is a server side rendered page it is necessary
    // const session = await auth("home");
    let playlists: PlaylistData[] | false = false;

    /* 
        This is workaround to get the playlists from a database with a fetch to be able to use 
        tagged data cache
        //TODO: wait for unstable_cache to be stable to use for revalidation on demand (submit trigger)
    */
    const res = await fetch(process.env.NEXTAUTH_URL + "/api/spotify/playlist", {
        method: "GET",
        headers: new Headers(headers()),
        next: { tags: ["playlist"] },
    }).then((res) => res.json());
    playlists = res;
    //TODO: ERROR HANDLING

    return (
        <div className="h-full w-full p-4 flex flex-col gap-8">
            <h1>playlistLabs</h1>
            <Link href="/pages/create-playlist">
                <div className=" flex gap-4 items-center p-2 w-full mb-4 bg-zinc-900/50 border border-zinc-700 rounded-xl">
                    <div className="size-20 bg-zinc-900/50 border border-zinc-700 rounded-lg flex items-center justify-center">
                        <MdAdd size="3rem"></MdAdd>
                    </div>
                    <h4>Create New Playlist</h4>
                </div>
            </Link>
            {/* render all playlists found in database for user */}
            {playlists &&
                playlists.map((playlist) => (
                    <PlaylistEntry playlist={playlist} key={playlist.playlist_id?.toString()} />
                ))}
            <Profile></Profile>
        </div>
    );
}

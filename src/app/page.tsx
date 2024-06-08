import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Profile";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { PlaylistData } from "@/types/spotify";

import { headers } from "next/headers";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

export default async function Home() {
    let playlists: PlaylistData[] | false = false;

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const bgColor = fullConfig.theme.colors.ui[950];
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
        <div className="h-full w-full p-4 flex flex-col gap-6">
            <div className="flex justify-between">
                <h2 className="font-normal text-themetext-nerfed">playlistLabs</h2>
                <Profile></Profile>
            </div>
            <hr className="border-ui-700 -mx-4" />
            <Link href="/pages/create-playlist">
                <div className="flex gap-4 items-center w-full mb-4 bg-ui-900 border border-ui-700 rounded-lg">
                    <div className="size-20 bg-ui-800 rounded-l-lg flex items-center justify-center">
                        <MdAdd size="3rem" color={bgColor}></MdAdd>
                    </div>
                    <h4 className="text-b6b6b6">Create New Playlist</h4>
                </div>
            </Link>
            {/* render all playlists found in database for user */}
            {playlists &&
                playlists.map((playlist) => (
                    <PlaylistEntry playlist={playlist} key={playlist.playlist_id?.toString()} />
                ))}
        </div>
    );
}

import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Profile";
import Link from "next/link";
import { MdAdd } from "react-icons/md";
import { PlaylistData } from "@/types/spotify";

import { headers } from "next/headers";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

import Image from "next/image";
import Logo from "../../public/logo.svg";

import { getAppUrl } from "@/lib/utils";

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

    const res = await fetch(getAppUrl() + "/api/spotify/playlist", {
        method: "GET",
        headers: new Headers(headers()),
        next: { tags: ["playlist"] },
    })
        .then((res) => res.json())
        .catch((err) => {
            console.log(err);
            return { error: err.message };
        });
    playlists = res;

    return (
        <div className="h-full w-full p-4 flex flex-col gap-5">
            <div className="flex justify-between gap-2 mt-8">
                <Image src={Logo} alt="playlistLabs Logo" width={16} height={16}></Image>
                <h3 className="font-normal text-themetext-nerfed flex-grow">playlistLabs</h3>
                <Profile></Profile>
            </div>
            <Link href="/pages/create-playlist">
                <div className="flex gap-4 items-center w-full mb-4 bg-ui-900 border border-ui-700 rounded-lg">
                    <div className="size-20 bg-ui-800 rounded-l-lg flex items-center justify-center">
                        <MdAdd size="3rem" color={bgColor}></MdAdd>
                    </div>
                    <h4 className="text-b6b6b6">Create New Playlist</h4>
                </div>
            </Link>
            {/* render all playlists found in database for user */}
            <h4>Your Playlists</h4>
            {playlists &&
                playlists.length > 0 &&
                playlists.map((playlist) => (
                    <PlaylistEntry playlist={playlist} key={playlist.playlist_id?.toString()} />
                ))}
        </div>
    );
}

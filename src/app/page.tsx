import { auth } from "@/lib/serverUtils";
import { redirect } from "next/navigation";

import { dbGetUsersPlaylists } from "@/lib/db/dbActions";

import ClientSessionProvider from "@/components/ClientSessionProvider";
import TransitionLink from "@/components/TransitionLink";
import PlaylistEntry from "@/components/PlaylistEntry";
import Profile from "@/components/Modals/Profile";

import { PlaylistData } from "@/types/spotify";

import Logo from "../../public/logo-v2.svg";
import { MdAdd } from "react-icons/md";

export default async function Home() {
    let playlistData: PlaylistData[] | null = null;

    const session = await auth("page");
    console.log("session: ", session);
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }

    const { data, error } = await dbGetUsersPlaylists(session.user.id);
    if (error) playlistData = null;
    else playlistData = data;

    return (
        <div className="h-full w-full p-4 flex flex-grow flex-col gap-5 sm:w-[40rem] lg:w-[50rem] sm:mx-auto">
            <ClientSessionProvider session={session}>
                <div className="flex justify-between gap-2 mt-8 items-center">
                    <Logo className="w-4 h-4 -mb-1"></Logo>
                    <h3 className="font-normal text-themetext-nerfed flex-grow">playlistLabs</h3>
                    <Profile></Profile>
                </div>
                <TransitionLink href="/pages/create-playlist" enter>
                    <div
                        className={`flex gap-4 items-center w-full mb-4 bg-ui-900 border border-ui-700 rounded-lg ${
                            playlistData && playlistData.length === 0 ? "animate-pulse" : ""
                        }`}
                    >
                        <div className="size-24 rounded-l-lg flex items-center justify-center border-r border-ui-700 text-ui-500">
                            <MdAdd></MdAdd>
                        </div>
                        <h4 className="text-ui-500">Create New Playlist</h4>
                    </div>
                </TransitionLink>
                {/* render all playlists found in database for user */}
                <h4 className="text-themetext-nerfed">Your Playlists</h4>
                {playlistData &&
                    playlistData.length > 0 &&
                    playlistData.map((playlist, index) => (
                        <PlaylistEntry
                            playlist={playlist}
                            key={playlist.playlist_id?.toString()}
                            isAboveTheFold={index < 10}
                        />
                    ))}
                {!playlistData ||
                    (playlistData.length === 0 && (
                        <div className="size-full flex-grow flex flex-col items-center bg-ui-850 text-ui-600 rounded-lg border border-ui-800">
                            <p className="text-center mt-16">
                                You don&apos;t have any playlists yet. <br /> Create one now!
                            </p>
                        </div>
                    ))}
            </ClientSessionProvider>
        </div>
    );
}

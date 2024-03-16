// Code: CreatePlaylist page
// "use client";

import { getUserLikedSongs, createPlaylist } from "@/lib/spotifyActions";
import { getAuthSession } from "@/lib/serverUtils";
import { redirect } from "next/navigation";
import Profile from "@/components/Profile";
import PlaylistCreator from "@/components/PlaylistCreator";

const CreatePlaylist = async () => {
    const helloWorld = () => {
        console.log("Hello World");
    };
    // const likedSongs = await getUserLikedSongs(session);

    // newPlaylist();

    return (
        <div>
            <Profile />
            <h1>Create Playlist</h1>
            {/* {session && <p>Logged in as {session.user.name}</p>} */}
            {/* <button onClick={helloWorld}>Hi</button> */}
            <PlaylistCreator />
        </div>
    );
};

export default CreatePlaylist;

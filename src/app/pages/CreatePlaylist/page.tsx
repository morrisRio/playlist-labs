// Code: CreatePlaylist page
"use client";

import { getUserLikedSongs, createPlaylist } from "@/lib/spotifyActions";
import { getAuthSession } from "@/lib/serverUtils";
import { redirect } from "next/navigation";
import Profile from "@/components/Profile";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { useEffect } from "react";

const CreatePlaylist = () => {
    const helloWorld = () => {
        console.log("Hello World");
    };
    // const likedSongs = await getUserLikedSongs(session);

    //get genre seeds on page load
    //useEffect only works on the client side
    useEffect(() => {
        const getGenreSeeds = async () => {
            const genreSeeds = await fetch("/api/spotify/genres");
            // console.log("genreSeeds:", genreSeeds);
        };
        getGenreSeeds();
    }, []);

    return (
        <div>
            <Profile />
            {/* {session && <p>Logged in as {session.user.name}</p>} */}
            {/* <button onClick={helloWorld}>Hi</button> */}
            <PlaylistCreator />
        </div>
    );
};

export default CreatePlaylist;

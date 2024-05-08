import React from "react";
import { Playlist } from "@/types/spotify";

interface PlaylistProps {
    playlist: Playlist;
}

/*
    how do i get the playlist data in here without fetching it again
    from the db when it is accesed through the home page but get the data 
    when it is accessed a link to the playlist page in the description?
*/

//create a store for the playlists and get data from the store for playlist id when the store exists
//if the store does not exist fetch the data from the db and create a store for the playlists

function PlaylistEntry({ playlist }: PlaylistProps) {
    console.log("PlaylistEntry: ", playlist);
    const { playlist_id } = playlist;
    console.log("PlaylistId ", playlist_id);
    return (
        <div className=" flex gap-4 items-center p-2 w-full mb-4 bg-zinc-900/50 border border-zinc-700 rounded-xl">
            <h4>{playlist.preferences.name}</h4>
            {}
        </div>
    );
}

export default PlaylistEntry;

//TODO: get image from spotify api

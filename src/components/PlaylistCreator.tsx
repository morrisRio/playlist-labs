"use client";

import { createPlaylist } from "@/lib/spotifyActions";
import { useState } from "react";

function Button() {
    const [playlistNameValue, setPlaylistNameValue] = useState("defaultName");
    const newPlaylist = async (formdata: any) => {
        await createPlaylist(
            formdata.get("playlistname"),
            "created by playlistLabs"
        );
    };

    return (
        <>
            <form action={newPlaylist}>
                <input
                    className="text-black"
                    type="text"
                    name="playlistname"
                    value={playlistNameValue}
                    onInput={(e) => setPlaylistNameValue(e.target.value)}
                />
                <button type="submit">Button</button>
            </form>
        </>
    );
}

export default Button;

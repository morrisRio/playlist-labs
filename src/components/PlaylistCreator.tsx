"use client";

import { createPlaylist } from "@/lib/spotifyActions";

function Button() {
    const newPlaylist = async (formdata: any) => {
        await createPlaylist(
            formdata.get("playlistname"),
            "created by playlistLabs"
        );
    };

    return (
        <>
            <form action={newPlaylist}>
                <input className="text-black" type="text" name="playlistname" />
                <button type="submit">Button</button>
            </form>
        </>
    );
}

export default Button;

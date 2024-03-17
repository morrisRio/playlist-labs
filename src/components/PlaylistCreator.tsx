"use client";

function Button() {
    const newPlaylist = async (formdata: FormData) => {
        console.log("fetching create-playlist with fromdata: ", formdata);
        await fetch("/api/spotify/create-playlist", {
            method: "POST",
            body: JSON.stringify({
                name: formdata.get("playlistname"),
            }),
        });
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

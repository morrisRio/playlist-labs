"use client";
import { BsSpotify } from "react-icons/bs";
import { signIn } from "next-auth/react";
import Logo from "../../../../../public/logo-small.svg";

function Login() {
    const handleLogin = () => {
        signIn("spotify", { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col flex-grow items-center justify-center gap-5 max-w-80 p-8 mx-auto">
            <div className="flex items-end gap-2 -mb-1">
                <div className="flex items-center gap-2">
                    <Logo className="size-5 -mb-1" />
                    <h2 className="font-normal">playlistLabs</h2>
                </div>
            </div>
            <div className="text-ui-500 text-center text-sm">
                Welcome to playlistLabs! <br />
                Tired with these same old playlists? <br />
                Had enough of those Lofi Songs sneaking into your Discover Weekly? <br />
                Say no more! <br />
                Discover new music you really like and take full control on your own Discover playlists.
                <br />
                <br />
                <br />
                Log in with Spotify to get started.
            </div>
            <button
                className="p-4 px-6 bg-themetext/90 text-ui-950 rounded-full flex gap-3 items-center"
                onClick={handleLogin}
            >
                <BsSpotify size="1.2rem" />
                Log in with Spotify
            </button>
        </div>
    );
}

export default Login;

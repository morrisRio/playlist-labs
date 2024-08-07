"use client";
import { BsSpotify } from "react-icons/bs";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Logo from "../../../../../public/logo-small.svg";

//TODO: PRODUCTION https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-3859770

function Login() {
    const handleLogin = () => {
        signIn("spotify", { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center gap-5 max-w-80 p-8 mx-auto">
            <div className="flex items-center gap-2 -mb-1">
                <Image src={Logo} alt="playlistLabs Logo" width={20} height={20} className="-mb-1"></Image>
                <h2 className="font-normal">playlistLabs</h2>
            </div>
            <div className="text-ui-500 text-center">
                Welcome to playlistLabs! <br />
                Discover new music and create your own Discover playlists.
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

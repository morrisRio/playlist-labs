"use client";
import { signIn } from "next-auth/react";

//TODO: PRODUCTION https://github.com/nextauthjs/next-auth/discussions/4394#discussioncomment-3859770

function Login() {
    const handleLogin = () => {
        signIn("spotify", { callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col min-h-screen items-center justify-center gap-10 ">
            <div>
                <h1>Welcome to playlistLab</h1>
                <p className="mt-10 ">Manage your Spotify playlists</p>
                <p>Discover new music</p>
                <p>Share your playlists</p>
            </div>
            <button
                className="p-4 bg-zinc-200 text-black rounded-md"
                onClick={handleLogin}
            >
                Login with Spotify
            </button>
        </div>
    );
}

export default Login;

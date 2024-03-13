"use client";
import { signIn } from "next-auth/react";

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
                className="p-5 bg-slate-300 text-slate-600 rounded"
                onClick={handleLogin}
            >
                Login with Spotify
            </button>
        </div>
    );
}

export default Login;

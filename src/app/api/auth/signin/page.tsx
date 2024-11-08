"use client";

import Logo from "../../../../../public/logo-small.svg";
import mockup from "../../../../../public/mockup.png";
import Rules from "../../../../../public/rules-v2.png";
import Schedule from "../../../../../public/schedule-v2.png";
import Library from "../../../../../public/library-v1.png";

import Image from "next/image";
import { useState } from "react";

import LoginDialog from "@/components/legal/LoginDialog";
import SeedCarousel from "@/components/SeedCarousel";
import { BsSpotify } from "react-icons/bs";
import { MdArrowDownward } from "react-icons/md";

function Login() {
    const [showDialog, setShowDialog] = useState(false);

    return (
        <>
            {showDialog && <LoginDialog onClose={() => setShowDialog(false)} />}
            <div className="min-h-screen flex flex-col gap-4 py-8 sm:container sm:mx-auto max-sm:overflow-x-hidden max-w-full">
                {/* hero section */}
                <div className="flex max-md:flex-col gap-16 max-w-full items-center max-md:gap-4 md:h-screen mb-8">
                    <div className="flex flex-col px-8 gap-4 md:gap-6 sm:flex-grow md:order-2">
                        <div className="flex gap-2 md:gap-3 items-center mb-6">
                            <Logo className="size-4 md:size-5 -mb-1" />
                            <h3 className="text-base md:text-lg">playlistLabs</h3>
                        </div>
                        <h1 className="md:text-5xl font-medium">
                            Discover Your <br /> Next Favorite Song. <br />
                            Every Time.
                        </h1>
                        <p className="text-ui-400 md:text-xl">
                            Take full control of new recommendations and dive into fresh music with playlists that are
                            made for you, by you.
                        </p>
                        <button
                            className="p-3 px-4 bg-themetext/90 text-ui-950 rounded-full flex gap-3 items-center  self-start max-md:self-end mt-10 z-30 cursor-pointer"
                            onClick={() => setShowDialog(true)}
                        >
                            <BsSpotify size="1.2rem" />
                            Log in with Spotify
                        </button>
                        <div className="flex gap-2 items-center text-ui-400 mt-8">
                            <MdArrowDownward />
                            Scroll down to learn more
                        </div>
                    </div>
                    <div className="-m-16 flex-grow mb-0 max-md:order-1 md:max-w-[50vw] relative pointer-events-none">
                        <Image src={mockup} alt="mockup" unoptimized />
                    </div>
                </div>
                {/* Intro Text */}
                <SeedCarousel></SeedCarousel>
                <div className="px-8 mt-4 md:mt-8 md:max-w-[500px] md:mx-auto">
                    <h2 className="font-medium mb-4">Embark on a Journey of Music Discovery</h2>
                    <p className="text-ui-400">
                        Feeling stuck in the same musical loop? playlistLabs lets you break free. Build custom playlists
                        by choosing a few favorite artists, genres, or tracks, and let our app unlock the full potential
                        of Spotify&#39;s algorithm — with you in control every step of the way.
                    </p>
                </div>
                {/* Rules */}
                <div className="px-8 flex max-md:flex-col items-center md:-mt-36">
                    <div className="-mx-20 -mb-20 -mt-8">
                        <Image src={Rules} alt="rules-showcase" unoptimized />
                    </div>
                    <div className="md:mt-96 md:-ml-16 md:max-w-[450px]">
                        <h2 className="font-medium mb-4">Tailored Exactly to Your Needs</h2>
                        <p className="text-ui-400">
                            Whether you&#39;re after upbeat tracks to get moving or something low-key for focus,
                            playlistLabs lets you design playlists for any mood. Prefer instrumental tracks? Done. Need
                            beats that sync with your running pace? We&#39;ve got you covered.
                        </p>
                    </div>
                </div>
                {/* Schedule */}
                <div className="px-8 flex max-md:flex-col items-center">
                    <div className="-mx-20 -mb-40 -mt-10 md:order-2 md:-mt-72">
                        <Image src={Schedule} alt="schedule-showcase" unoptimized />
                    </div>
                    <div className="md:ml-32 md:-mr-16 md:max-w-[450px]">
                        <h2 className="font-medium mb-4">
                            Fresh Ingredients delivered
                            <br />
                            Just In Time
                        </h2>
                        <p className="text-ui-400">
                            playlistLabs turns music discovery into a seamless habit. Whether you&#39;re after daily new
                            tracks for a shower jam session or want to dive deeper into a favorite genre every weekend —
                            Integrated directly with your Spotify library, playlistLabs helps you go beyond your typical
                            listening pattern, serving you fresh sounds true to your taste
                        </p>
                    </div>
                </div>
                {/* Library */}
                <div className="px-8 mx-auto flex flex-col items-center">
                    <div className="-mx-16 -mb-20 max-w-[860px]">
                        <Image src={Library} alt="library-showcase" unoptimized />
                    </div>
                    <h2 className="font-medium mb-4 md:-mt-24 md:text-3xl">
                        Music discovery made simple,
                        <br />
                        enjoyable, and entirely
                        <br />
                        on your terms.
                    </h2>
                    <div className="flex flex-col flex-grow items-center justify-center gap-5 max-w-80 p-8">
                        <p className="text-ui-400">Get started now!</p>
                        <button
                            className="p-3 px-6 bg-themetext/90 text-ui-950 rounded-full flex gap-3 items-center"
                            onClick={() => setShowDialog(true)}
                        >
                            <BsSpotify size="1.2rem" />
                            Log in with Spotify
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;

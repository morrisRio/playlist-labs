"use client";

import Logo from "../../../../../public/logo-v2.svg";
import mockup from "../../../../../public/mockup.png";
import Rules from "../../../../../public/rules-v2.png";
import Schedule from "../../../../../public/schedule-v2.png";
import Library from "../../../../../public/library-v1.png";
import UniModal from "@/components/Modals/UniModal";

import Image from "next/image";
import { useState } from "react";

import LoginDialog from "@/components/legal/LoginDialog";
import SeedCarousel from "@/components/SeedCarousel";
import { BsSpotify } from "react-icons/bs";
import { MdArrowDownward, MdInfoOutline } from "react-icons/md";

function Login() {
    const [showDialog, setShowDialog] = useState(false);
    const [showDisclaimer, setShowDisclaimer] = useState(false);
    const [showBanner, setShowBanner] = useState(true);

    return (
        <>
            {showBanner && (
                <div className="flex mx-auto mt-8 -mb-16 max-sm:flex-col text-amber-500 border border-amber-600 p-4 rounded-lg bg-amber-950/30 gap-4 items-center text-base sticky z-50">
                    <div className="max-md:mx-2 md:my-2">
                        <MdInfoOutline size="20px" />
                    </div>
                    <div className="max-sm:pt-4 max-sm:border-t max-sm:border-t-amber-700  sm:pl-4 sm:border-l sm:border-l-amber-700">
                        Spotify has deprecated several core features of their Web API as of November 27th. This is a
                        demo of the original functionality. While at it, consider checking out{" "}
                        <a
                            href="https://music.apple.com/us/subscribe"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline hover:text-amber-700"
                        >
                            {" "}
                            Apple Music
                        </a>{" "}
                        or{" "}
                        <a
                            href="https://soundcloud.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold underline hover:text-amber-700"
                        >
                            SoundCloud
                        </a>
                        .
                    </div>
                </div>
            )}
            {showDisclaimer && (
                <UniModal
                    title="⚠️ Spotify said no"
                    onClose={() => setShowDisclaimer(false)}
                    action={() => {
                        setShowDisclaimer(false);
                        setShowDialog(true);
                    }}
                    actionTitle="Continue to Demo"
                >
                    <div className="p-6 font-sans text-ui-400">
                        <h2 className="text-2xl font-bold mb-4">Notice: Limited Functionality</h2>
                        <p className="mb-4">
                            <strong className="text-themetext">
                                Due to Spotify&#39;s decision to deprecate several core features of their Web API as of{" "}
                                November 27th , this app can no longer create or manage playlists dynamically.
                            </strong>
                            <br />
                            <br />
                            To demonstrate its original functionality, i&#39;ve included a{" "}
                            <strong className="text-themetext">demo mode</strong> showcasing pre-created playlists from
                            when the app was fully operational.
                        </p>
                        <p className="mb-4">
                            While appreciating Spotify&#39;s contributions to the developer community, this decision has
                            left many projects — and developers — with limited options. If you&#39;re looking for a
                            platform that better supports both innovation and artists, consider exploring alternatives
                            like
                            <a
                                href="https://music.apple.com/us/subscribe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {" "}
                                Apple Music
                            </a>
                            ,
                            <a
                                href="https://soundcloud.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {" "}
                                SoundCloud
                            </a>
                            , or other artist-focused services.
                        </p>
                        <p className="mb-6">Thank you for your understanding, and we hope you enjoy the demo!</p>
                    </div>
                </UniModal>
            )}
            {showDialog && <LoginDialog onClose={() => setShowDialog(false)} />}
            <div className="min-h-screen flex flex-col gap-4 py-8 sm:container sm:mx-auto max-sm:overflow-x-hidden max-w-full">
                {/* hero section */}
                <div className="flex max-md:flex-col gap-16 max-w-full items-center max-md:gap-4 md:h-screen mb-8">
                    <div className="flex flex-col px-8 gap-4 md:gap-6 sm:flex-grow md:order-2">
                        <div className="flex gap-2 md:gap-3 items-center mb-6">
                            <Logo className="size-4 md:size-5 -mb-1" />
                            <h3 className="text-base md:text-lg font-regular">playlistLabs</h3>
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
                            onClick={() => setShowDisclaimer(true)}
                        >
                            <BsSpotify size="1.2rem" />
                            Log in with Spotify
                        </button>
                        <div className="flex gap-2 items-center text-ui-600 mt-2 mb-8 self-center md:self-start">
                            <div className="animate-bounce">
                                <MdArrowDownward />
                            </div>
                            Or scroll down to learn more
                        </div>
                    </div>
                    <div className="-m-16 flex-grow mb-0 max-md:order-1 md:max-w-[50vw] relative pointer-events-none">
                        <Image src={mockup} alt="mockup" unoptimized />
                    </div>
                </div>
                {/* Intro Text */}
                <SeedCarousel></SeedCarousel>
                <div className="px-8 mt-4 md:mt-8 md:max-w-[500px] md:mx-auto mb-10 md:mb-24">
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
                            onClick={() => setShowDisclaimer(true)}
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

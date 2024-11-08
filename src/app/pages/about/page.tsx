"use client";

import { CSSProperties, useState } from "react";
import Image from "next/image";
import Logo from "../../../../public/logo-small-v2.svg";
import Obi from "../../../../public/obi-wan.webp";
import Link from "next/link";

export default function About() {
    const [showObi, setShowObi] = useState(false);

    const obiStyle: CSSProperties = {
        position: "absolute",
        top: "5vh",
        left: showObi ? "-140px" : "-400px", // Slide in from the left side
        transform: showObi ? "rotate(30deg)" : "rotate(0deg)",
        opacity: showObi ? 1 : 0,
        transition: "all 0.3s ease-in-out", // Smooth transition
        transformOrigin: "center",
        pointerEvents: "none",
        width: "300px",
    };

    return (
        <div className="relative">
            <div style={obiStyle}>
                <Image src={Obi} alt="hello there" unoptimized></Image>
            </div>
            <div className="bg-ui-950 px-4 pt-4 md:px-0 w-full h-fit flex flex-col gap-4 justify-center rounded-b-2xl sm:w-[40rem] lg:w-[50rem] sm:mx-auto text-ui-500">
                <Link href="/" className="flex justify-between gap-2 mt-8 items-center">
                    <Logo className="w-4 h-4 -mb-1"></Logo>
                    <h3 className="font-normal text-themetext-nerfed flex-grow">playlistLabs</h3>
                </Link>

                <h2 onMouseEnter={() => setShowObi(true)} onMouseLeave={() => setShowObi(false)}>
                    Hello There!
                </h2>
                <p>
                    playlistLabs is a free-to-use web app developed purely for entertainment. We aim to help you
                    discover new music in a personalized, engaging way. While we use Spotify&#39;s API to integrate with
                    your library, please know that playlistLabs is an independent app and has no official affiliation
                    with Spotify.
                </p>
                <p>
                    If you have any issues, questions, or suggestions for new features, please reach out at{" "}
                    <a className="text-themetext underline" href="mailto:hello@playlist-labs.com">
                        hello@playlist-labs.com
                    </a>
                    . We&#39;d love to hear from you!
                </p>
                <h3 className="mt-6 font-semibold">Privacy and Data</h3>
                <p>
                    You can delete your account and all associated data anytime. Just log in, go to the Profile menu at
                    the top right of your Dashboard, and select &quot;Delete Account.&quot;
                </p>
                <p>
                    We prioritize your privacy and only store the essential data required to make the app function. We
                    don&#39;t read or store any of your playlist data that isn&#39;t directly related to
                    playlistLabs&#39; features. For more information on data use, see our{" "}
                    <a href="#privacy-policy">Privacy Policy</a>.
                </p>
                <div className="mt-6 border border-ui-700 bg-ui-850 p-4 rounded-lg flex flex-col gap-2 text-sm text-ui-400">
                    <h4 className="font-semibold">Privacy Policy</h4>
                    Your privacy is important to us. Here&#39;s a clear explanation of how we handle your data at
                    playlistLabs:
                    <h5 className="font-semibold mt-4">Data Collection and Use</h5>
                    We only collect the minimum data necessary to make the app function. This includes:
                    <ul className="text-sm list-disc list-inside">
                        <li>
                            Your Spotify ID, username, and access/refresh tokens (required for connecting to Spotify and
                            updating playlists).
                        </li>
                        <li>
                            Information on playlists created and settings associated with them (so we can display and
                            update them automatically).
                        </li>
                    </ul>
                    <h5 className="font-semibold mt-4">Third-Parties</h5>
                    We do not share your information with any third parties, nor do we store any third-party cookies.
                    Your data stays entirely within the playlistLabs ecosystem.
                    <h5 className="font-semibold mt-4">Functional Cookies</h5>
                    <p className="text-sm">
                        We use functional cookies in your browser to manage login data and keep you logged in. By using
                        the app, you accept this necessary functionality. If you&#39;d like to clear cookies, you can
                        log out of the app or delete your browser cookies. For any questions or additional information,
                        feel free to contact us at <a href="mailto:hello@playlist-labs.com">hello@playlist-labs.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}

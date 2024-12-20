import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";

import { twUi500 } from "@/lib/utils";

import "./globals.css";
import SpotifyFull from "../../public/spotify-full.svg";

const ibmPlexSans = localFont({
    src: [
        {
            path: "./fonts/IBMPlexSans-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexSans-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "./fonts/IBMPlexSans-Bold.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    fallback: ["sans-serif"],
    display: "swap",
    variable: "--font-ibm",
});

export const metadata: Metadata = {
    title: "playlistLabs",
    description: "Generate Spotify playlists based on your preferences",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body
                className={`${ibmPlexSans.variable} font-ibm antialiased relative overflow-x-hidden min-h-screen pb-24`}
            >
                <NextTopLoader height={2} color={twUi500} crawlSpeed={50} initialPosition={0.1} showSpinner={false} />
                <main className="min-h-[calc(100vh-96px)] flex flex-col">{children}</main>
                <div className="absolute text-ui-500 w-full z-40 bottom-8">
                    <div className="mx-auto flex gap-2 items-center text-sm w-fit">
                        <span className="text-nowrap">Powered by</span>
                        <div className="text-white w-[80px]">
                            <SpotifyFull />
                        </div>
                        <span className="text-nowrap">Web API</span>|
                        <a href="/pages/about" className="text-nowrap underline">
                            About
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}

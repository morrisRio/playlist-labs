import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { twUi500 } from "@/lib/utils";
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
                    <div className="w-64 mx-auto flex gap-2 items-center">
                        <h5 className="text-nowrap">Powered by</h5>
                        <div className="text-white w-full">
                            <SpotifyFull />
                        </div>
                        <h5 className="text-nowrap">Web API</h5>
                    </div>
                </div>
            </body>
        </html>
    );
}

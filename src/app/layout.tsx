import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { getServerSession } from "next-auth";
import SessionProvider from "../components/SessionProvider";

const ibmPlexSans = localFont({
    src: [
        {
            path: "./fonts/IBMPlexSans-Regular.woff2",
            weight: "400",
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

export default async function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const session = await getServerSession();
    return (
        <html lang="en">
            <body
                className={`${ibmPlexSans.variable} font-ibm antialiased bg-zinc-950`}
            >
                <SessionProvider session={session}>
                    <main className="min-h-screen">{children}</main>
                </SessionProvider>
            </body>
        </html>
    );
}

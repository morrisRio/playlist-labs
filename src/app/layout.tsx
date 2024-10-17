import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { twUi500 } from "@/lib/utils";

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className={`${ibmPlexSans.variable} font-ibm antialiased relative overflow-x-hidden`}>
                <NextTopLoader height={2} color={twUi500} crawlSpeed={50} initialPosition={0.1} showSpinner={false} />
                <main className="min-h-screen h-screen">{children}</main>
            </body>
        </html>
    );
}

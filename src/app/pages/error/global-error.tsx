"use client";

//TODO: implement this

import Broken from "../../../../public/broken-logo.svg";
import { useEffect } from "react";

interface ErrorPageProps {
    error: Error;
    reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
    useEffect(() => {
        console.error("Error: ", error);
    }, [error]);

    return (
        <html>
            <body className="h-screen flex flex-col justify-center items-center gap-5">
                <Broken className="w-32"></Broken>
                <p>Something went wrong. We&apos;re Sorry.</p>
                {/* <a href="/"> */}
                <button onClick={() => reset()} className="px-4 py-2 bg-themetext font-normal text-ui-900 rounded-lg">
                    Try Again
                </button>
                {/* </a> */}
            </body>
        </html>
    );
};

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading-dark.json";
import { BsSpotify } from "react-icons/bs";
import { NextResponse } from "next/server";

interface LoginDialogProps {
    onClose: () => void;
}

function LoginDialog({ onClose }: LoginDialogProps) {
    const [showLoading, setShowLoading] = useState(false);
    const handleDemoSignIn = async () => {
        setShowLoading(true);
        try {
            const res = await fetch("/api/auth/signin/demo", {
                method: "POST",
            });
            if (res.ok) {
                const targetUrl = res.url || "/";
                console.log("Demo user signed in successfully. Redirecting to:", targetUrl);
                window.location.href = targetUrl; // Redirect to the server-provided URL
            } else {
                alert("Failed to sign in as demo user.");
            }
        } catch (error) {
            console.error("Error during demo sign-in:", error);
            alert("An error occurred during demo sign-in.");
        } finally {
            setShowLoading(false);
        }
    };

    const triggerClose = (e: React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault;
        onClose();
    };

    useEffect(() => {
        const scrollTop = window.scrollY;

        document.body.style.position = "fixed";
        document.body.style.overflowY = "scroll";
        document.body.style.top = `-${scrollTop}px`;
        document.body.style.width = "100%";

        return () => {
            document.body.style.position = "relative";
            window.scrollTo(0, scrollTop);
            document.body.style.top = "0";
            document.body.style.overflowY = "auto";
            document.body.style.width = "100%";
        };
    }, []);

    const hStyles = "font-semibold text-themetext";

    return (
        <div
            className={`items-center fixed inset-0 w-full h-screen max-sm:p-2 sm:p-6 flex justify-center bg-ui-950/40 backdrop-brightness-50 backdrop-saturate-50 z-50`}
            onPointerDown={(e) => triggerClose(e)}
        >
            <div
                className={`w-full h-fit max-h-full max-w-[650px] md:m-auto px-6 py-5 bg-ui-900 border border-ui-700 rounded-xl z-50 flex flex-col gap-4`}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <h3 className="font-medium">Before you Continue</h3>

                <div className="max-h-full overflow-y-auto p-4 -mx-6 border-y border-ui-700 bg-ui-850 flex flex-col gap-2 text-ui-500">
                    <h5 className={`mt-6 font-semibold text-themetext`}>Legal Notice</h5>
                    <p className="text-sm">
                        playlistLabs is a free web application designed to enhance your Spotify experience. We&#39;re
                        not affiliated with Spotify in any way. We just use their API to let you create custom playlists
                        directly within your Spotify library.
                    </p>
                    <p className="text-sm">
                        We take responsibility for this page and disclaim any liability on the part of third parties.
                    </p>
                    <h5 className={`mt-6 font-semibold text-themetext`}>Terms of Use</h5>
                    <p className="text-sm">
                        By continuing, you agree to our data handling practices, which include only storing the
                        information necessary to make the app work smoothly. We respect your privacy and don&#39;t
                        collect, store, or share any more than needed. For detailed information, see our{" "}
                        <Link href="#privacy-policy">Privacy Policy</Link> below.
                    </p>
                    <div className="mt-6 border border-ui-700 bg-ui-800 p-4 rounded-lg flex flex-col gap-2 text-sm text-ui-400">
                        <h4 className="font-semibold">Privacy Policy</h4>
                        Your privacy is important to us. Here&#39;s a clear explanation of how we handle your data at
                        playlistLabs:
                        <h5 className="font-semibold mt-4">Data Collection and Use</h5>
                        We only collect the minimum data necessary to make the app function. This includes:
                        <ul className="text-sm list-disc list-inside">
                            <li>
                                Your Spotify ID, username, and access/refresh tokens (required for connecting to Spotify
                                and updating playlists).
                            </li>
                            <li>
                                Information on playlists created and settings associated with them (so we can display
                                and update them automatically).
                            </li>
                        </ul>
                        <h5 className="font-semibold mt-4">Third-Parties</h5>
                        We do not share your information with any third parties, nor do we store any third-party
                        cookies. Your data stays entirely within the playlistLabs ecosystem.
                        <h5 className="font-semibold mt-4">Functional Cookies</h5>
                        <p className="text-sm">
                            We use functional cookies in your browser to manage login data and keep you logged in. By
                            using the app, you accept this necessary functionality. If you&#39;d like to clear cookies,
                            you can log out of the app or delete your browser cookies. For any questions or additional
                            information, feel free to contact us at{" "}
                            <a href="mailto:hello@playlist-labs.com">hello@playlist-labs.com</a>.
                        </p>
                    </div>
                </div>

                <div className="flex justify-start items-center sm:justify-end gap-4 sm:items-start sm:gap-8 md:pb-8 md:pt-2 flex-col sm:flex-row">
                    <div className="relative flex sm:order-2 text-ui-600 items-center flex-col gap-2">
                        <button
                            className={` p-3 px-4 min-h-12 ${
                                showLoading ? "bg-themetext-nerfed text-ui-800" : "bg-themetext text-ui-950"
                            }  rounded-full flex gap-3 items-center hover:bg-themetext/90`}
                            onClick={handleDemoSignIn}
                        >
                            <div className="size-5">
                                {showLoading ? (
                                    <div className="-m-5">
                                        <Lottie animationData={Loading}></Lottie>
                                    </div>
                                ) : (
                                    <BsSpotify size="20px" />
                                )}
                            </div>
                            Continue with Spotify
                        </button>
                        <p>
                            {"("} Try Demo {")"}
                        </p>
                    </div>
                    <button
                        className="sm:order-1 min-h-12 p-2 px-8 min-w-32 bg-ui-900 text-base rounded-full text-center hover:bg-ui-800 border border-ui-700"
                        onClick={() => onClose()}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LoginDialog;

"use client";
import { MdChevronLeft, MdModeEdit, MdPalette, MdOpenInNew, MdShuffle, MdOutlineDelete } from "react-icons/md";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCssHueGradient, getCssHexGradient } from "@/lib/utils";
import { prominent } from "color.js";

import Link from "next/link";
import Image from "next/image";

import NameModal from "@/components/PlaylistCreator/NameModal";
import GradientModal from "@/components/GradientModal";
import ContextMenu from "@/components/Context";
import UniModal from "@/components/UniModal";
import { useHeaderState } from "@/lib/hooks/useHeaderState";

interface PlaylistHeaderProps {
    pageTitle: string;
    playlist_id: string | false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    hue: number | false;
    coverUrl: string | false;
    action: (e: FormEvent<HTMLFormElement>) => void;
    actionTitle: string;
    submitting: boolean;
}

function PlaylistHeader({
    pageTitle,
    playlist_id,
    onChange,
    name,
    hue,
    coverUrl,
    actionTitle,
    submitting,
}: PlaylistHeaderProps) {
    const [showNameModal, setShowNameModal] = useState(playlist_id === false);
    const [showGradient, setShowGradient] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);

    let blackGradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.8) 100%)";

    const bgImage = hue
        ? getCssHueGradient(hue)
        : coverUrl
        ? `url(${coverUrl})`
        : getCssHueGradient(Math.floor(Math.random() * 360));

    const headerBg = `linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.7) 100%), ${bgImage}`;

    const headerRef = useRef<HTMLDivElement>(null);
    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const { headerHeight, collapsed, headerOpacity } = useHeaderState(headerRef, actionButtonRef);

    const deleteAccount = async () => {
        console.log("Deleting Account");
    };

    return (
        <>
            <header ref={headerRef} className="sticky top-0 z-40">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: headerBg,
                        opacity: headerOpacity,
                        backgroundSize: "cover",
                    }}
                ></div>
                <div
                    className="absolute inset-0"
                    style={{ backdropFilter: `blur(64px) opacity(${headerOpacity ? 1 : 0})` }}
                ></div>
                <div className="relative flex items-center w-full py-3 px-4 z-10">
                    <Link href="/" replace={true}>
                        <MdChevronLeft size="2rem"></MdChevronLeft>
                    </Link>
                    <h3 className="flex-grow">{pageTitle}</h3>
                    <button
                        form="playlist-form"
                        type="submit"
                        className={`flex items-center gap-2 text-lg text-themetext rounded-lg p-1 px-2 transition-opacity duration-200 mx-2 ${
                            collapsed ? "opacity-100" : "invisible opacity-0"
                        }`}
                    >
                        <MdShuffle size="1.2rem" />
                        {actionTitle}
                    </button>
                    <ContextMenu contextTitle={"Playlist Options"}>
                        <a
                            href={`https://open.spotify.com/playlist/${playlist_id}`}
                            target="_blank"
                            className="text-ui-600"
                        >
                            <MdOpenInNew />
                            Open in Spotify
                        </a>
                        <button onPointerDown={() => setShowConfirmModal(true)} className="text-red-800">
                            <MdOutlineDelete />
                            Delete Playlist
                        </button>
                    </ContextMenu>
                    {showConfirmModal && (
                        <UniModal
                            title="Delete Account"
                            action={deleteAccount}
                            actionTitle="Delete"
                            actionDanger={true}
                            onClose={() => setShowConfirmModal(false)}
                        >
                            <p>
                                This action will delete your account and all associated data irreversibly. This includes
                                all playlists and preferences. In fact that&apos;s all we store for you
                                <br />
                                <br />
                                For security reasons we won&apos;t delete generated playlists on Spotify.
                            </p>
                        </UniModal>
                    )}
                </div>
            </header>
            <div
                className="relative top-0 w-full bg-ui-850"
                style={{
                    backgroundImage: `${blackGradient},` + bgImage,
                    backgroundSize: "cover",
                    paddingTop: `${headerHeight}px`,
                    marginTop: `-${headerHeight}px`,
                }}
            >
                <div
                    className="absolute size-full backdrop-blur-3xl"
                    style={{
                        paddingTop: `${headerHeight}px`,
                        marginTop: `-${headerHeight}px`,
                    }}
                ></div>
                <div className="flex flex-col justify-between w-full pt-2 pb-2 px-4 bg-cover gap-6">
                    <div className="flex items-center w-full gap-8">
                        {/* Image */}
                        <div className=" size-36 rounded-lg overflow-hidden relative z-20">
                            {coverUrl && !hue && <Image src={coverUrl} alt="cover-image" fill></Image>}
                            {hue && (
                                <div
                                    className="w-full h-full"
                                    style={{ backgroundImage: getCssHueGradient(hue) }}
                                ></div>
                            )}
                            <div
                                className="absolute right-1 bottom-1 rounded-full flex items-center justify-center bg-ui-900 p-1"
                                onPointerDown={() => setShowGradient(true)}
                            >
                                <MdPalette size="0.8rem" />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col items-center justify-between gap-1 z-30 -mt-5">
                            <button
                                type="submit"
                                form="playlist-form"
                                className={`flex items-center gap-2 p-2 px-4 min-w-32 border border-themetext-nerfed text-themetext text-lg rounded-lg text-center`}
                                disabled={submitting}
                                ref={actionButtonRef}
                            >
                                <MdShuffle size="1.2rem" />
                                {actionTitle}
                            </button>
                            <a
                                href={`https://open.spotify.com/playlist/${playlist_id}`}
                                target="blank"
                                className="text-ui-600 flex items-center gap-2"
                            >
                                Open in Spotify
                                <MdOpenInNew />
                            </a>
                        </div>
                    </div>
                    <div className="-mx-4 absolute bg-ui-950 border-t border-ui-700 h-[88px] w-full bottom-0 rounded-t-2xl"></div>
                    <div className="flex justify-between z-10">
                        <h2>{name}</h2>
                        <MdModeEdit size="1.5em" onClick={() => setShowNameModal(true)} />
                    </div>
                </div>
            </div>
            {showNameModal && <NameModal name={name} onClose={() => setShowNameModal(false)} onChange={onChange} />}
            {showGradient && <GradientModal onClose={() => setShowGradient(false)} onSave={onChange} />}
        </>
    );
}

export default PlaylistHeader;

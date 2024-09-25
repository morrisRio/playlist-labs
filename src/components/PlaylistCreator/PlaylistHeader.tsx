"use client";
import {
    MdChevronLeft,
    MdModeEdit,
    MdPalette,
    MdOpenInNew,
    MdShuffle,
    MdOutlineDelete,
    MdRefresh,
} from "react-icons/md";
import { BsStars } from "react-icons/bs";
import { AiOutlineSave } from "react-icons/ai";
import { FormEvent, useEffect, useRef, useState } from "react";
import useSWR, { Fetcher } from "swr";
import { getCssHueGradient } from "@/lib/utils";

import Link from "next/link";

import NameModal from "@/components/PlaylistCreator/NameModal";
import GradientModal from "@/components/GradientModal";
import ContextMenu from "@/components/Context";
import UniModal from "@/components/UniModal";
import { useHeaderState } from "@/lib/hooks/useHeaderState";

import { dbDeletePlaylist } from "@/lib/db/dbActions";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import { IconType } from "react-icons";

interface PlaylistHeaderProps {
    pageTitle: string;
    playlist_id: string | false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    hue: number | undefined;
    action: (e: FormEvent<HTMLFormElement>) => void;
    actionName: String;
    actionIcon: IconType;
    submitting: boolean;
    resetSettings: () => void;
    emptySettings: () => void;
    router: AppRouterInstance;
    somethingToRestore: boolean;
}

function PlaylistHeader({
    pageTitle,
    playlist_id,
    onChange,
    name,
    hue,
    actionName,
    actionIcon: ActionIcon,
    submitting,
    resetSettings,
    emptySettings,
    router,
    somethingToRestore,
}: PlaylistHeaderProps) {
    const [showNameModal, setShowNameModal] = useState(playlist_id === false);
    const [showGradient, setShowGradient] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const headerRef = useRef<HTMLDivElement>(null);
    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const { headerHeight, collapsed } = useHeaderState(headerRef, actionButtonRef);

    const deletePlaylist = async () => {
        if (!playlist_id) return;
        dbDeletePlaylist(playlist_id);
        router.replace("/");
        router.refresh();
    };

    const fetcher: Fetcher<string> = (url: string) => fetch(url).then((res) => res.json());

    const {
        data: coverUrl,
        error,
        isLoading,
    } = useSWR(playlist_id ? `/api/spotify/playlist/cover/${playlist_id}` : null, fetcher, { revalidateOnMount: true });
    const [bgImage, setBgImage] = useState<string>(
        hue !== undefined ? getCssHueGradient(hue) : isLoading || error ? "" : coverUrl ? `url(${coverUrl})` : ""
    );

    useEffect(() => {
        setBgImage(
            hue !== undefined ? getCssHueGradient(hue) : isLoading || error ? "" : coverUrl ? `url(${coverUrl})` : ""
        );
    }, [coverUrl, hue, isLoading, error]);

    const bgStyle = {
        backgroundImage: bgImage,
        backgroundSize: "cover",
        filter: `saturate(0.7) brightness(0.45)`,
    };

    return (
        <>
            <header ref={headerRef} className="sticky top-0 z-40">
                <div className="absolute inset-0 overflow-hidden rounded-b-lg">
                    <div className="w-full aspect-square" style={bgStyle}>
                        <div className="absolute inset-0" style={{ backdropFilter: `blur(64px)` }}></div>
                    </div>
                </div>
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
                        <ActionIcon />
                        {actionName}
                    </button>
                    {playlist_id ? (
                        <ContextMenu contextTitle={"Playlist Options"}>
                            <a
                                href={`https://open.spotify.com/playlist/${playlist_id}`}
                                target="_blank"
                                className="text-ui-500"
                            >
                                <MdOpenInNew />
                                Open in Spotify
                            </a>
                            <button onPointerDown={() => setShowResetModal(true)} className="text-ui-500">
                                <MdRefresh />
                                {somethingToRestore ? "Restore Settings" : "Reset Settings"}{" "}
                            </button>
                            <button onPointerDown={() => setShowConfirmModal(true)} className="text-red-800">
                                <MdOutlineDelete />
                                Delete Playlist
                            </button>
                        </ContextMenu>
                    ) : (
                        <ContextMenu contextTitle={"Playlist Options"}>
                            <button onPointerDown={() => setShowResetModal(true)} className="text-ui-600">
                                <MdRefresh />
                                Reset Settings
                            </button>
                        </ContextMenu>
                    )}

                    {showResetModal && (
                        <UniModal
                            title={(somethingToRestore ? "Restore" : "Reset") + "Settings"}
                            action={() => {
                                somethingToRestore ? resetSettings() : emptySettings();
                                setShowResetModal(false);
                            }}
                            actionTitle={somethingToRestore ? "Restore" : "Reset"}
                            onClose={() => setShowResetModal(false)}
                        >
                            {somethingToRestore ? (
                                <p>Are you sure you want to restore the Settings to the previously saved Settings?</p>
                            ) : (
                                <p>Are you sure you want to reset all settings?</p>
                            )}
                        </UniModal>
                    )}

                    {showConfirmModal && (
                        <UniModal
                            title="Delete Playlist"
                            action={deletePlaylist}
                            actionTitle="Delete"
                            actionDanger={true}
                            onClose={() => setShowConfirmModal(false)}
                        >
                            <div className="w-full flex flex-col gap-4 ">
                                <ul className="list-disc list-inside">
                                    <li>The playlist will remain on Spotify but won&apos;t update here.</li>
                                    <li>All associated data will be permanently removed.</li>
                                    <li>This action is irreversible</li>
                                </ul>

                                <p>Are you sure you want to delete this playlist?</p>
                            </div>
                        </UniModal>
                    )}
                </div>
            </header>
            <div className="relative top-0 w-full bg-ui-850">
                <div className="absolute size-full overflow-hidden" style={{ marginTop: `-${headerHeight}px` }}>
                    <div className="w-full aspect-square bg-cover" style={bgStyle}>
                        <div className="absolute inset-0" style={{ backdropFilter: `blur(64px)` }}></div>
                    </div>
                </div>
                <div className="flex flex-col justify-between w-full pt-3 pb-2 px-4 bg-cover gap-5">
                    <div className="flex items-center w-full gap-6">
                        {/* Image */}
                        <div className="size-36 rounded-lg overflow-hidden relative z-20">
                            {isLoading && (
                                <div className="size-full bg-ui-700 flex-none p-8">
                                    <Lottie animationData={Loading}> </Lottie>
                                </div>
                            )}
                            <div
                                className="w-full h-full bg-ui-700"
                                style={{ backgroundImage: bgImage, backgroundSize: "cover" }}
                                role="presentation"
                            ></div>

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
                                <ActionIcon />
                                {actionName}
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
                    <div className="-mx-4 absolute bg-ui-950 border-t border-ui-700 h-[90px] w-full bottom-0 rounded-t-2xl"></div>
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

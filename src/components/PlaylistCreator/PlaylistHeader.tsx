"use client";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import NameModal from "@/components/Modals/NameModal";
import GradientModal from "@/components/Modals/GradientModal";
import ContextMenu from "@/components/Modals/Context";
import UniModal from "@/components/Modals/UniModal";
import { dbDeletePlaylist } from "@/lib/db/dbActions";

import { useHeaderState } from "@/lib/hooks/useHeaderState";
import useSwrTokenRefresh from "@/lib/hooks/useSwrTokenRefresh";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import TransitionLink from "../TransitionLink";

import { MdModeEdit, MdPalette, MdOpenInNew, MdOutlineDelete, MdRefresh, MdOutlineArrowBackIos } from "react-icons/md";
import { IconType } from "react-icons";

import usePlaylistBackground from "@/lib/hooks/usePlaylistBackground";

interface PlaylistHeaderProps {
    pageTitle: string;
    playlist_id: string | false;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    initialName: string;
    hue: number | undefined;
    action: (e: React.PointerEvent<HTMLButtonElement>) => void;
    actionName: String;
    actionIcon: IconType;
    submitting: boolean;
    resetSettings: () => void;
    emptySettings: () => void;
    router: AppRouterInstance;
    somethingToRestore: boolean;
}

const PlaylistHeader = memo(
    function PlaylistHeader({
        pageTitle,
        playlist_id,
        onChange,
        name,
        initialName,
        hue,
        action,
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

        const deletePlaylist = useCallback(async () => {
            if (!playlist_id) return;
            await dbDeletePlaylist(playlist_id);
            router.replace("/");
            router.refresh();
        }, [playlist_id, router]);

        const { data: coverUrl, isLoading } = useSwrTokenRefresh<string>(
            playlist_id ? `/api/spotify/playlist/cover/${playlist_id}` : null
        );

        const headerRef = useRef<HTMLDivElement>(null);
        const actionButtonRef = useRef<HTMLButtonElement>(null);
        const { headerHeight, collapsed, triggerProgress } = useHeaderState(headerRef, actionButtonRef);

        const styles = usePlaylistBackground({ hue, triggerProgress, coverUrl });

        const actionNameShort = useMemo(() => actionName.split(" ")[0], [actionName]);

        const triggerTimestamp = useRef<number>();

        const handleOpenNameModal = () => {
            triggerTimestamp.current = Date.now();
            setShowNameModal(true);
        };
        return (
            <>
                <header ref={headerRef} className="sticky top-0 z-40 w-full bg-[#202020] rounded-b-lg ">
                    {/* headerBg */}
                    <div className="absolute inset-0 rounded-b-lg overflow-hidden">
                        <div className="absolute inset-0 aspect-square w-[max(100vw,100vh)] ">
                            {styles.gradientBackground ? (
                                <div className="size-full" style={styles.gradientHeaderBackground}></div>
                            ) : (
                                <div className="w-full h-full bg-ui-800"></div>
                            )}
                        </div>
                    </div>
                    {/* controls */}
                    <div className="relative flex items-center w-full gap-4 py-3 px-4 z-10 sm:w-[40rem] lg:w-[50rem] sm:mx-auto">
                        <TransitionLink href="/" replace={true}>
                            <div className="p-4 -m-4">
                                <MdOutlineArrowBackIos />
                            </div>
                        </TransitionLink>
                        <h3 className="flex-grow">{pageTitle}</h3>
                        <button
                            onPointerDown={(e) => action(e)}
                            className={`flex items-center gap-2 text-lg text-themetext rounded-lg p-1 px-2 transition-opacity duration-200 mx-2 ${
                                collapsed ? "opacity-100" : "invisible opacity-0"
                            }`}
                        >
                            <ActionIcon />
                            {actionNameShort}
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
                                title={(somethingToRestore ? "Restore" : "Reset") + " Settings"}
                                action={() => {
                                    somethingToRestore ? resetSettings() : emptySettings();
                                    setShowResetModal(false);
                                }}
                                actionTitle={somethingToRestore ? "Restore" : "Reset"}
                                onClose={() => setShowResetModal(false)}
                            >
                                {somethingToRestore ? (
                                    <p>
                                        Are you sure you want to restore the Settings to the previously saved Settings?
                                    </p>
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
                                        <li>This action is irreversible.</li>
                                    </ul>

                                    <p>Are you sure you want to delete this playlist?</p>
                                </div>
                            </UniModal>
                        )}
                    </div>
                </header>

                <div className="relative top-0 w-full">
                    {/* bigBg */}
                    <div className="absolute overflow-hidden -z-30" style={{ marginTop: `-${headerHeight}px` }}>
                        <div className="fixed inset-0 aspect-square w-[max(100vw,100vh)]">
                            {styles.gradientBackground ? (
                                <div className="size-full" style={styles.gradientBackground}></div>
                            ) : (
                                <div className="w-full h-full bg-ui-800"></div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col justify-between w-full pt-3 pb-2 px-4 bg-cover gap-5 sm:w-[40rem] lg:w-[50rem] sm:mx-auto relative sm:px-12">
                        <div className="flex items-center w-full gap-6 sm:justify-between">
                            <div className="relative size-36 rounded-lg overflow-hidden bg-ui-600 z-20">
                                {hue ? (
                                    <div className="size-full" style={styles.gradient}></div>
                                ) : coverUrl ? (
                                    <Image
                                        src={coverUrl}
                                        alt="playlist cover image"
                                        fill={true}
                                        sizes="96px"
                                        unoptimized
                                        priority
                                    />
                                ) : (
                                    <div className="size-full bg-ui-800"></div>
                                )}
                                {isLoading && (
                                    <div className="absolute inset-0 bg-ui-700/20 flex-none p-8">
                                        <Lottie animationData={Loading}> </Lottie>
                                    </div>
                                )}

                                <div
                                    className="absolute right-1 bottom-1 rounded-full flex items-center justify-center bg-ui-900 p-1"
                                    onPointerDown={() => setShowGradient(true)}
                                >
                                    <MdPalette size="1rem" />
                                </div>
                            </div>
                            {/* controls */}
                            <div className="flex flex-col items-center justify-between gap-1 z-30 -mt-5">
                                <button
                                    onPointerDown={(e) => action(e)}
                                    className={`flex items-center gap-2 p-2 px-4 min-w-32 border border-themetext-nerfed text-themetext text-lg rounded-lg text-center`}
                                    disabled={submitting}
                                    ref={actionButtonRef}
                                >
                                    <ActionIcon />
                                    {actionName}
                                </button>
                                {playlist_id && (
                                    <a
                                        href={`https://open.spotify.com/playlist/${playlist_id}`}
                                        target="_blank"
                                        className="text-ui-600 flex items-center gap-2"
                                    >
                                        Open in Spotify
                                        <MdOpenInNew />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="-mx-4 absolute bg-ui-950 border-t border-ui-700 h-[90px] w-full bottom-0 rounded-t-2xl sm:-mx-12"></div>
                        <div className="flex justify-between z-10">
                            <h2>{name}</h2>
                            <div className="text-themetext/65">
                                <MdModeEdit size="1.2em" onPointerDown={() => handleOpenNameModal()} />
                            </div>
                        </div>
                    </div>
                </div>
                {showNameModal && (
                    <NameModal
                        name={name}
                        onClose={() => setShowNameModal(false)}
                        onChange={onChange}
                        initialName={initialName}
                        triggerTimestamp={triggerTimestamp.current}
                    />
                )}
                {showGradient && <GradientModal onClose={() => setShowGradient(false)} onSave={onChange} />}
            </>
        );
    },
    (prevProps, nextProps) => {
        //rerender if any of these props change
        return (
            prevProps.playlist_id === nextProps.playlist_id &&
            prevProps.name === nextProps.name &&
            prevProps.hue === nextProps.hue &&
            prevProps.actionName === nextProps.actionName &&
            prevProps.submitting === nextProps.submitting &&
            prevProps.somethingToRestore === nextProps.somethingToRestore &&
            prevProps.action === nextProps.action
        );
    }
);

export default PlaylistHeader;

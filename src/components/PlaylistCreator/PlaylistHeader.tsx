"use client";
import { MdChevronLeft, MdModeEdit, MdMoreVert, MdPalette, MdOpenInNew, MdShuffle } from "react-icons/md";
import NameModal from "./NameModal";
import GradientModal from "../GradientModal";
import { FormEvent, PointerEventHandler, use, useCallback, useEffect, useRef, useState } from "react";
import { getCssGradient } from "@/lib/spotifyUtils";
import Link from "next/link";
import Image from "next/image";

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
    action,
    actionTitle,
    submitting,
}: PlaylistHeaderProps) {
    const [showNameModal, setShowNameModal] = useState(playlist_id === false);
    const [showGradient, setShowGradient] = useState(false);

    let bgImage = "";

    let blackGradient = "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 1) 100%)";

    if (!hue && coverUrl) {
        bgImage = `url(${coverUrl})`;
    } else if (hue) {
        bgImage = `${getCssGradient(hue)}`;
    }

    const darken = "linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.6) 100%)";
    let headerBg = ` ${darken}, ${bgImage}`;

    const headerRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(60);

    const actionButtonRef = useRef<HTMLButtonElement>(null);
    const [triggerPoint, setTriggerPoint] = useState(0);

    const [collapsed, setCollapsed] = useState(false);
    const [headerOpacity, setHeaderOpacity] = useState(0);

    const handleScroll = useCallback(() => {
        setHeaderOpacity(collapsed ? 1 : triggerPoint > 0 ? window.scrollY / triggerPoint : 0);

        if (collapsed && window.scrollY < triggerPoint) {
            setCollapsed(false);
        } else if (!collapsed && window.scrollY > triggerPoint) {
            setCollapsed(true);
        }
    }, [triggerPoint, collapsed]);

    useEffect(() => {
        if (actionButtonRef.current) {
            setTriggerPoint(actionButtonRef.current.clientHeight + window.scrollY);
            console.log("setting trigger point", actionButtonRef.current);
        }
    }, [actionButtonRef]);

    useEffect(() => {
        if (headerRef.current) {
            setHeaderHeight(headerRef.current.clientHeight);
        }
    }, [headerRef]);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        //determine the initial state of the header
        handleScroll();
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <>
            <header ref={headerRef} className="sticky top-0 z-40">
                <div className="absolute inset-0" style={{ backgroundImage: headerBg, opacity: headerOpacity }}></div>
                <div className="relative flex items-center w-full py-3 z-10">
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
                    <MdMoreVert size="1.5em" onClick={() => console.log("more")} className="mr-5" />
                </div>
            </header>
            <div
                className="relative top-0 w-full"
                style={{
                    backgroundImage: `${blackGradient},` + bgImage,
                    paddingTop: `${headerHeight}px`,
                    marginTop: `-${headerHeight}px`,
                }}
            >
                <div className="flex flex-col justify-between w-full pt-5 pb-2 px-4 bg-cover gap-6">
                    <div className="flex items-center w-full gap-8">
                        {/* Image */}
                        <div className="size-32 rounded-lg overflow-hidden relative">
                            {coverUrl && !hue && <Image src={coverUrl} alt="cover-image" fill></Image>}
                            {hue && (
                                <div className="w-full h-full" style={{ backgroundImage: getCssGradient(hue) }}></div>
                            )}
                            <div
                                className="absolute right-1 bottom-1 rounded-full flex items-center justify-center bg-ui-900 p-1"
                                onPointerDown={() => setShowGradient(true)}
                            >
                                <MdPalette size="0.8rem" />
                            </div>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-col items-center justify-between gap-2">
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
                    <div className="flex justify-between">
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

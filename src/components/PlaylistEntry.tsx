"use client";
import Image from "next/image";

import TransitionLink from "@/components/TransitionLink";
import SmartMarquee from "@/components/SmartMarquee";
import useSwrTokenRefresh from "@/lib/hooks/useSwrTokenRefresh";

import { PlaylistData } from "@/types/spotify";

import { MdChevronRight } from "react-icons/md";
import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import Logo from "../../public/broken-logo.svg";

interface PlaylistEntryProps {
    playlist: PlaylistData;
    isAboveTheFold?: boolean;
}

function PlaylistEntry({ playlist, isAboveTheFold }: PlaylistEntryProps) {
    const { playlist_id, seeds } = playlist;
    const { name, frequency, amount } = playlist.preferences;

    const {
        data: coverUrl,
        error,
        isLoading,
    } = useSwrTokenRefresh<string>(`/api/spotify/playlist/cover/${playlist_id}`);

    return (
        <TransitionLink href={`/pages/edit-playlist/${playlist_id}`} enter>
            <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt="playlist cover image"
                            fill={true}
                            sizes="96px"
                            unoptimized
                            priority={isAboveTheFold}
                        />
                    ) : error ? (
                        <p className="text-ui-700 p-4">
                            <Logo></Logo>
                        </p>
                    ) : (
                        <div className="size-24 bg-ui-800/30 rounded-l-lg flex-none p-5">
                            <Lottie animationData={Loading}> </Lottie>
                        </div>
                    )}
                    {isLoading && (
                        <div className="absolute inset-0 size-24  bg-ui-850/30 rounded-l-lg flex-none p-5">
                            <Lottie animationData={Loading}> </Lottie>
                        </div>
                    )}
                </div>
                <div className="flex flex-col overflow-hidden flex-grow">
                    <SmartMarquee divider={true}>
                        <h4 className="font-medium mb-0 text-nowrap text-base text-themetext-nerfed">{name}</h4>
                    </SmartMarquee>
                    <p className="text-ui-600 text-sm">
                        {" "}
                        {frequency[0].toUpperCase() + frequency.slice(1)} • {amount + " Tracks"}
                    </p>
                    <SmartMarquee>
                        {seeds.map((seed) => (
                            <span
                                key={seed.id}
                                className="text-xs border border-ui-650 text-ui-650 rounded-full px-2 text-nowrap mr-2"
                            >
                                {seed.title}
                            </span>
                        ))}
                    </SmartMarquee>
                </div>
                <div className="text-ui-650">
                    <MdChevronRight size="1.5rem"></MdChevronRight>
                </div>
            </div>
        </TransitionLink>
    );
}

export default PlaylistEntry;

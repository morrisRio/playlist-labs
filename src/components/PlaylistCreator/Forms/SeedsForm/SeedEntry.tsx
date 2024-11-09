"use client";
import Image from "next/image";

import SmartMarquee from "@/components/SmartMarquee";

import { Seed } from "@/types/spotify";

import { RiMusic2Fill } from "react-icons/ri";
import { MdRemoveCircleOutline, MdAddCircleOutline, MdOpenInNew } from "react-icons/md";

import SpotifyLogo from "../../../../../public/spotify.svg";

type SeedEntryProps = {
    seedObj: Seed;
    onRemove?: (id: string) => void;
    onAdd?: (seed: Seed) => void;
    card?: boolean;
    added?: boolean;
    isAboveTheFold?: boolean;
    display?: boolean;
};

export function SeedEntry({
    seedObj,
    onRemove,
    onAdd,
    card = false,
    added = false,
    isAboveTheFold,
    display = false,
}: SeedEntryProps): JSX.Element {
    //display is true for seeds on landing page

    const { description, title, thumbnail, type } = seedObj;

    let imgSize = "size-14";
    let imgRound = type === "artist" ? "rounded-full" : "rounded-lg";
    let seedCard = "";
    let textSize = "text-base";

    if (card) {
        imgRound = type === "artist" ? "rounded-full" : "rounded-l-lg";
        imgSize = type === "artist" ? "size-16 m-2" : "size-[4.5rem]";
        seedCard = "bg-ui-900 border border-ui-700 rounded-lg";
    }

    if (added && !card) {
        seedCard = `bg-ui-900 shadow-[0_0_0_1px] shadow-ui-700 rounded-lg`;
        imgRound = type === "artist" ? "rounded-full" : "rounded-l-lg";
    }

    if (display) {
        seedCard = "bg-ui-900 border border-ui-700 rounded-lg w-64 pr-3";
        imgSize = type === "artist" ? "size-14 m-2" : "size-[4rem]";
        textSize = "text-sm";
    }

    const imgClass = `${imgSize} ${imgRound}`;

    const linkToSpotify = `https://open.spotify.com/${type}/${seedObj.id}`;

    return (
        <div className={`flex gap-4 items-center justify-between ${seedCard}`}>
            {seedObj.type === "genre" ? (
                <div
                    className={`${imgClass} flex items-center justify-center`}
                    style={{
                        backgroundColor: `hsl(${thumbnail} 80 40)`,
                    }}
                >
                    <RiMusic2Fill size={card ? "2rem" : "1.2rem"} color={`hsl(${thumbnail} 90 70)`} />
                </div>
            ) : thumbnail && typeof thumbnail === "string" ? (
                <div className={`${imgClass} flex-none relative overflow-hidden`}>
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        loading={isAboveTheFold && card ? undefined : "lazy"}
                        unoptimized
                    />
                </div>
            ) : (
                <div className={`${imgClass} flex-none bg-zinc-800`}></div>
            )}
            <div className="flex-auto overflow-hidden">
                {card ? (
                    <>
                        <p className={`whitespace-nowrap overflow-hidden truncate ${textSize}`}>{title}</p>
                        <p className={`text-ui-600 whitespace-nowrap truncate ${textSize}`}>{description}</p>
                    </>
                ) : (
                    <>
                        <SmartMarquee divider>
                            <p className={`${textSize} whitespace-nowrap`}>{title}</p>
                        </SmartMarquee>
                        <SmartMarquee divider>
                            <p className={`text-ui-600 ${textSize}`}>{description}</p>
                        </SmartMarquee>
                    </>
                )}
            </div>
            {seedObj.type !== "genre" && (
                <a href={linkToSpotify} target="_blank" className="h-[21px] flex gap-1 items-center text-themetext/65">
                    {!card || (display && <SpotifyLogo className="size-5 text-white"></SpotifyLogo>)}
                    {!display && <MdOpenInNew></MdOpenInNew>}
                </a>
            )}
            {added && onRemove && (
                <button className="justify-end mr-4" onClick={() => onRemove(seedObj.id)} type="button">
                    <MdRemoveCircleOutline size="1.5rem" className="text-themetext/65" />
                </button>
            )}
            {!added && onAdd && (
                <button className="justify-end mr-4" onClick={() => onAdd(seedObj)} type="button">
                    <MdAddCircleOutline size="1.5rem" className="text-themetext/65" />
                </button>
            )}
        </div>
    );
}

export default SeedEntry;

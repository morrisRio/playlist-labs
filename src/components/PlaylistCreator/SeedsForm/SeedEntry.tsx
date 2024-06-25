"use client";

import { RiMusic2Fill } from "react-icons/ri";
import { MdRemoveCircleOutline, MdAddCircleOutline } from "react-icons/md";
import Marquee from "react-fast-marquee";
import { Seed } from "@/types/spotify";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

import { useState, useRef, useLayoutEffect } from "react";

import Image from "next/image";

//using marquee. Docs:
//https://www.react-fast-marquee.com/documentation

type SeedEntryProps = {
    seedObj: Seed;
    onRemove: (id: string) => void;
    onAdd?: (seed: Seed) => void;
    card?: boolean;
    added?: boolean;
};

export function SeedEntry({ seedObj, onRemove, onAdd, card = false, added = false }: SeedEntryProps): JSX.Element {
    const { description, title, thumbnail, type } = seedObj;

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.themetext["DEFAULT"] + "a8"; //a8 is 65% opacity

    let imgSize = "size-14";
    let imgRound = type === "artist" ? "rounded-full" : "rounded-lg";
    let seedCard = "";

    if (card) {
        imgRound = type === "artist" ? "rounded-full" : "rounded-l-lg";
        imgSize = type === "artist" ? "size-16 m-2" : "size-[4.5rem]";
        seedCard = "bg-ui-900 border border-ui-700 rounded-lg";
    }

    if (added && !card) {
        seedCard = `bg-ui-900 shadow-[0_0_0_1px] shadow-ui-700 rounded-lg`;
        imgRound = type === "artist" ? "rounded-full" : "rounded-l-lg";
    }

    const imgClass = `${imgSize} ${imgRound}`;

    const [titleTooLong, setTitleTooLong] = useState(false);
    const [descTooLong, setDescTooLong] = useState(false);

    const titleRef = useRef<HTMLParagraphElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);

    useLayoutEffect(() => {
        const titleElem = titleRef.current;
        const descElem = descRef.current;

        const checkOverflow = () => {
            if (titleElem) {
                setTitleTooLong(titleElem.scrollWidth > titleElem.clientWidth);
            }
            if (descElem) {
                setDescTooLong(descElem.scrollWidth > descElem.clientWidth);
            }
        };

        const resizeObserver = new ResizeObserver(checkOverflow);
        if (titleElem) {
            resizeObserver.observe(titleElem);
        }

        // Initial check in case the element is already overflowing
        checkOverflow();

        // Cleanup observer on component unmount
        return () => {
            if (titleElem) {
                resizeObserver.unobserve(titleElem);
            }
        };
    }, [title, description]);

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
                    <Image src={thumbnail} alt={title} fill />
                </div>
            ) : (
                <div className={`${imgClass} flex-none bg-zinc-800`}></div>
            )}
            <div className="flex-auto overflow-hidden">
                {titleTooLong && !card ? (
                    <Marquee play={true} speed={30} delay={1}>
                        <p className="text-base whitespace-nowrap">{title + "\xa0-\xa0"}</p>
                    </Marquee>
                ) : (
                    <p ref={titleRef} className="text-base whitespace-nowrap overflow-hidden truncate">
                        {title}
                    </p>
                )}

                {descTooLong && !card ? (
                    <Marquee speed={30}>
                        <p className={`text-ui-600 text-base`}>{description + "\xa0-\xa0"}</p>
                    </Marquee>
                ) : (
                    <p ref={descRef} className={`text-ui-600 text-base whitespace-nowrap truncate`}>
                        {description}
                    </p>
                )}
            </div>
            {added && (
                <button className="justify-end mr-4" onClick={() => onRemove(seedObj.id)} type="button">
                    <MdRemoveCircleOutline size="1.5rem" color={interactColor} />
                </button>
            )}
            {!added && onAdd && (
                <button className="justify-end mr-4" onClick={() => onAdd(seedObj)} type="button">
                    <MdAddCircleOutline size="1.5rem" color={interactColor} />
                </button>
            )}
        </div>
    );
}

export default SeedEntry;

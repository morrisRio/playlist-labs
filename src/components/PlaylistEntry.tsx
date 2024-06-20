import { PlaylistData } from "@/types/spotify";
import { headers } from "next/headers";
import Link from "next/link";
import SmartMarquee from "@/components/SmartMarquee";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";
import { MdChevronRight } from "react-icons/md";
import Image from "next/image";
import { getAppUrl } from "@/lib/utils";

interface PlaylistProps {
    playlist: PlaylistData;
}

async function PlaylistEntry({ playlist }: PlaylistProps) {
    const { playlist_id, seeds } = playlist;
    const { name, frequency, amount } = playlist.preferences;

    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.ui[600] || "#fff";

    console.log(
        "GETTING PLAYLIST COVER IMAGE",
        getAppUrl() + `/api/spotify/playlist/cover-image?playlist_id=${playlist_id}`
    );
    const url = await fetch(getAppUrl() + `/api/spotify/playlist/cover-image?playlist_id=${playlist_id}`, {
        method: "GET",
        headers: new Headers(headers()),
        next: { tags: ["playlist"] },
    })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                const { message } = data;
                throw new Error("Network response was not ok " + res.status + " " + message);
            }
            return data;
        })
        .catch((error) => {
            console.log("Error on Server Component:", error);
            return false;
        });

    return (
        <Link href={`/pages/edit-playlist/${playlist_id}`}>
            <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                {url && (
                    <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
                        <Image src={url} alt="playlist cover image" fill={true} />
                    </div>
                )}
                {!url && <div className="size-24 bg-ui-800 rounded-l-lg"></div>}
                <div className="flex flex-col overflow-hidden flex-grow">
                    <SmartMarquee divider={true}>
                        <h4 className="font-semibold mb-0 text-nowrap">{name}</h4>
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
                <div>
                    <MdChevronRight color={interactColor} size="2rem"></MdChevronRight>
                </div>
            </div>
        </Link>
    );
}

export default PlaylistEntry;

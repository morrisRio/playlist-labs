// import { PlaylistData } from "@/types/spotify";
// import { headers } from "next/headers";
// import Link from "next/link";
// import SmartMarquee from "@/components/SmartMarquee";

// import { MdChevronRight } from "react-icons/md";
// import Image from "next/image";
// import { getAppUrl } from "@/lib/utils";

// interface PlaylistProps {
//     playlist: PlaylistData;
// }

// async function PlaylistEntry({ playlist }: PlaylistProps) {
//     const { playlist_id, seeds } = playlist;
//     const { name, frequency, amount } = playlist.preferences;

//     //TODO: checck waht happens when token is expired
//     const url = await fetch(getAppUrl() + `/api/spotify/playlist/cover/${playlist_id}`, {
//         method: "GET",
//         headers: new Headers(headers()),
//         next: { tags: ["playlist"] },
//     })
//         .then(async (res) => {
//             const data = await res.json();
//             if (!res.ok) {
//                 const { message } = data;
//                 throw new Error("response !ok: " + res.status + " " + message);
//             }
//             return data;
//         })
//         .catch((error) => {
//             console.log("Error  getiing urls on Server Component:", error);
//             return false;
//         });

//     return (
//         <Link href={`/pages/edit-playlist/${playlist_id}`}>
//             <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
//                 {url && (
//                     <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
//                         <Image src={url} alt="playlist cover image" fill={true} sizes="96px" />
//                     </div>
//                 )}
//                 {!url && <div className="size-24 bg-ui-800 rounded-l-lg"></div>}
//                 <div className="flex flex-col overflow-hidden flex-grow">
//                     <SmartMarquee divider={true}>
//                         <h4 className="font-semibold mb-0 text-nowrap">{name}</h4>
//                     </SmartMarquee>
//                     <p className="text-ui-600 text-sm">
//                         {" "}
//                         {frequency[0].toUpperCase() + frequency.slice(1)} • {amount + " Tracks"}
//                     </p>
//                     <SmartMarquee>
//                         {seeds.map((seed) => (
//                             <span
//                                 key={seed.id}
//                                 className="text-xs border border-ui-650 text-ui-650 rounded-full px-2 text-nowrap mr-2"
//                             >
//                                 {seed.title}
//                             </span>
//                         ))}
//                     </SmartMarquee>
//                 </div>
//                 <div className="text-themetext">
//                     <MdChevronRight size="2rem"></MdChevronRight>
//                 </div>
//             </div>
//         </Link>
//     );
// }

// export default PlaylistEntry;

"use client";

import useSWR, { Fetcher } from "swr";

import { PlaylistData } from "@/types/spotify";
import Link from "next/link";
import SmartMarquee from "@/components/SmartMarquee";

import { MdChevronRight } from "react-icons/md";
import Image from "next/image";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import Logo from "../../public/logo.svg";
import { useRouter } from "next/navigation";
import { mutate } from "swr";

interface PlaylistProps {
    playlist: PlaylistData;
}

function PlaylistEntry({ playlist }: PlaylistProps) {
    //TODO: migration auth(req, res) call
    const router = useRouter();
    const { playlist_id, seeds } = playlist;
    const { name, frequency, amount } = playlist.preferences;

    const fetcher: Fetcher<string> = (url: string) =>
        fetch(url).then((res) => {
            try {
                if (!res.ok) {
                    if (res.status === 401) {
                        console.log("401 error");
                        router.refresh();
                        mutate(`/api/spotify/playlist/cover/${playlist_id}`);
                    }
                    throw new Error("response !ok: " + res.status);
                }
                return res.json();
            } catch (error) {
                console.log("Error getting coverUrls", error);
                return "fallback";
            }
        });
    // const options = {
    //     revalidateOnMount: true,
    // };

    //TODO: on 401 (token expired) refresh router
    const { data: coverUrl, error, isLoading } = useSWR(`/api/spotify/playlist/cover/${playlist_id}`, fetcher);
    if (error) {
        console.log("Error getting cover image:", error);
    }
    console.log("CoverUrl:", coverUrl);
    return (
        <Link href={`/pages/edit-playlist/${playlist_id}`}>
            <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                {coverUrl ? (
                    coverUrl === "fallback" ? (
                        <div className="size-24 bg-ui-800 rounded-l-lg text-ui-700 relative flex-none p-4">
                            <Logo />
                        </div>
                    ) : (
                        <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
                            <Image src={coverUrl} alt="playlist cover image" fill={true} sizes="96px" />
                        </div>
                    )
                ) : isLoading ? (
                    <div className="size-24 bg-ui-850 rounded-l-lg flex-none p-5">
                        <Lottie animationData={Loading}> </Lottie>
                    </div>
                ) : error ? (
                    <div className="size-24 bg-ui-850 rounded-l-lg flex-none p-5">
                        <p className="text-ui-600">
                            <Logo></Logo>
                        </p>
                    </div>
                ) : (
                    <div className="size-24 bg-ui-800 rounded-l-lg"></div>
                )}
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
                <div className="text-themetext">
                    <MdChevronRight size="2rem"></MdChevronRight>
                </div>
            </div>
        </Link>
    );
}

export default PlaylistEntry;

"use client";

import { PlaylistData } from "@/types/spotify";
import Link from "next/link";
import SmartMarquee from "@/components/SmartMarquee";

import { MdChevronRight } from "react-icons/md";
import Image from "next/image";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import Logo from "../../public/logo.svg";

import useSwrTokenRefresh from "@/lib/hooks/useSwrTokenRefresh";

interface PlaylistProps {
    playlist: PlaylistData;
}

function PlaylistEntry({ playlist }: PlaylistProps) {
    const { playlist_id, seeds } = playlist;
    const { name, frequency, amount } = playlist.preferences;

    const {
        data: coverUrl,
        error,
        isLoading,
    } = useSwrTokenRefresh<string>(`/api/spotify/playlist/cover/${playlist_id}`);

    return (
        <Link href={`/pages/edit-playlist/${playlist_id}`}>
            <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
                {coverUrl ? (
                    <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
                        <Image src={coverUrl} alt="playlist cover image" fill={true} sizes="96px" />
                    </div>
                ) : isLoading ? (
                    <div className="size-24 bg-ui-850 rounded-l-lg flex-none p-5">
                        <Lottie animationData={Loading}> </Lottie>
                    </div>
                ) : error ? (
                    <div className="size-24 bg-ui-800 rounded-l-lg flex-none p-5">
                        <p className="text-ui-700">
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

// "use client";

// import useSWR, { Fetcher, SWRConfiguration, Revalidator, RevalidatorOptions } from "swr";
// import { useSession } from "next-auth/react";

// import { PlaylistData } from "@/types/spotify";
// import Link from "next/link";
// import SmartMarquee from "@/components/SmartMarquee";

// import { MdChevronRight } from "react-icons/md";
// import Image from "next/image";

// import Lottie from "lottie-react";
// import Loading from "@/lib/lotties/loading.json";
// import Logo from "../../public/logo.svg";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { useSWRConfig } from "swr";
// interface PlaylistProps {
//     playlist: PlaylistData;
// }

// function PlaylistEntry({ playlist }: PlaylistProps) {
//     const { playlist_id, seeds } = playlist;
//     const { name, frequency, amount } = playlist.preferences;

//     const { data: session, update: updateSession } = useSession();

//     //@ts-ignore
//     if (session && session.accessToken) {
//         //@ts-ignore
//         console.log("Token in client component: ", session.accessToken.slice(0, 10) + "...");
//     }

//     const { mutate } = useSWRConfig();

//     const [retryCount, setRetryCount] = useState<number>(0);

//     const fetchWithToken: Fetcher<string> = (url: string) =>
//         fetch(url).then(async (res) => {
//             console.log("RetryCount:", retryCount);
//             try {
//                 setRetryCount((oldCount) => oldCount + 1);
//                 //double failsafe if the token was updated in the backend an client sill uses old token
//                 if (!res.ok) {
//                     if (res.status === 401) {
//                         if (retryCount < 3) {
//                             console.log("Unauthorized, trying to refresh. Try: ", retryCount);
//                             await updateSession();
//                             mutate(`/api/spotify/playlist/cover/${playlist_id}`);
//                         } else {
//                             console.log("Max retries reached, resetting but not mutating");
//                             setRetryCount(0);
//                             console.log("RetryCount:", retryCount);
//                         }
//                     }

//                     // error.info = await res.json();
//                     // error.status = res.status;
//                     console.error("Error fetching cover image:", await res.json());
//                     throw new Error("Something went wrong");
//                 }
//                 setRetryCount(0);
//                 const result = await res.json();
//                 console.log("Got it:", result);
//                 return result;
//             } catch (error) {
//                 console.log("Error in catch", error);
//                 return "fallback";
//             }
//         });

//     const options = {
//         revalidateOnMount: true,
//         shouldRetryOnError: false,
//     };

//     const {
//         data: coverUrl,
//         error,
//         isLoading,
//     } = useSWR(`/api/spotify/playlist/cover/${playlist_id}`, fetchWithToken, options);
//     if (error) {
//         console.log("Error getting cover image:", error);
//     }
//     return (
//         <Link href={`/pages/edit-playlist/${playlist_id}`}>
//             <div className="flex gap-4 items-center w-full bg-ui-900 border border-ui-700 rounded-lg">
//                 {coverUrl ? (
//                     coverUrl === "fallback" ? (
//                         <div className="size-24 bg-ui-800 rounded-l-lg text-ui-700 relative flex-none p-4">
//                             <Logo />
//                         </div>
//                     ) : (
//                         <div className="size-24 bg-ui-800 rounded-l-lg relative overflow-hidden flex-none">
//                             <Image src={coverUrl} alt="playlist cover image" fill={true} sizes="96px" />
//                         </div>
//                     )
//                 ) : isLoading ? (
//                     <div className="size-24 bg-ui-850 rounded-l-lg flex-none p-5">
//                         <Lottie animationData={Loading}> </Lottie>
//                     </div>
//                 ) : error ? (
//                     <div className="size-24 bg-ui-800 rounded-l-lg flex-none p-5">
//                         <p className="text-ui-700">
//                             <Logo></Logo>
//                         </p>
//                     </div>
//                 ) : (
//                     <div className="size-24 bg-ui-800 rounded-l-lg"></div>
//                 )}
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

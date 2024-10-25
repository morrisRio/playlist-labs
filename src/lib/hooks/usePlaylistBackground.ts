//swr approch
// import useSWR from "swr";
// import { extractColors } from "extract-colors";
// import { getCssHueGradient, getDistinctColors } from "@/lib/utils";

// interface PlaylistBackgroundProps {
//     hue?: number;
//     backgroundFilter: string;
//     coverUrl?: string;
// }

// const createGradientString = (colors: [string, string]) => {
//     const primaryColor = colors[0] || "#ff0000";
//     const secondaryColor = colors[1] || "#202020";
//     return `linear-gradient(13deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
// };

// const usePlaylistBackground = ({ hue, backgroundFilter, coverUrl }: PlaylistBackgroundProps) => {
//     const { data: imageGradient } = useSWR(
//         coverUrl ? ["gradient", coverUrl] : null,
//         async () => {
//             const colors = await extractColors(coverUrl!);
//             const distinctColors = getDistinctColors(colors);
//             return createGradientString(distinctColors);
//         },
//         {
//             revalidateOnFocus: false,
//             shouldRetryOnError: false,
//         }
//     );

//     return {
//         gradient: {
//             background: hue !== undefined ? getCssHueGradient(hue) : undefined,
//         },
//         gradientBackground: {
//             background: hue !== undefined ? getCssHueGradient(hue) : imageGradient,
//             filter: backgroundFilter,
//             transition: "background 5s",
//         },
//         background: {
//             filter: backgroundFilter,
//         },
//     };
// };

// export default usePlaylistBackground;

//custom approch
// import { useMemo, useCallback, useState } from "react";
// import { extractColors } from "extract-colors";
// import { getCssHueGradient } from "@/lib/utils";

// // Custom hook to handle async state
// const useAsync = <T>(asyncFn: () => Promise<T>) => {
//     const [state, setState] = useState<{
//         loading: boolean;
//         error?: Error;
//         data?: T;
//     }>({ loading: true });

//     // Only run when the function reference changes
//     useMemo(() => {
//         asyncFn()
//             .then((data) => setState({ loading: false, data }))
//             .catch((error) => setState({ loading: false, error }));
//     }, [asyncFn]);

//     return state;
// };

// interface PlaylistBackgroundProps {
//     hue?: number;
//     backgroundFilter: string;
//     coverUrl?: string;
// }

// const usePlaylistBackground = ({ hue, backgroundFilter, coverUrl }: PlaylistBackgroundProps) => {
//     // Memoize the gradient creation function
//     const createGradientString = useCallback((colors: Array<{ hex: string }>) => {
//         const primaryColor = colors[0]?.hex || "#ff0000";
//         const secondaryColor = colors[2]?.hex || "#202020";
//         return `linear-gradient(13deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
//     }, []);

//     // Memoize the color extraction function
//     const extractGradientFromUrl = useCallback(async () => {
//         if (!coverUrl) return undefined;
//         const colors = await extractColors(coverUrl);
//         return createGradientString(colors);
//     }, [coverUrl, createGradientString]);

//     // Get the gradient using our async hook
//     const { data: imageGradient } = useAsync(extractGradientFromUrl);

//     // Memoize the final gradients object
//     return useMemo(() => {
//         const hueGradient = hue !== undefined ? getCssHueGradient(hue) : undefined;

//         return {
//             gradient: {
//                 background: hueGradient,
//             },
//             gradientBackground: {
//                 background: hueGradient || imageGradient,
//                 filter: backgroundFilter,
//                 transition: "background 5s",
//             },
//             background: {
//                 filter: backgroundFilter,
//             },
//         };
//     }, [hue, imageGradient, backgroundFilter]);
// };

// export default usePlaylistBackground;

//useEffect approch
import { useState, useEffect, useMemo, useCallback } from "react";
import { extractColors } from "extract-colors";
import { getCssHueGradient, getDistinctColors } from "@/lib/utils";

interface PlaylistBackgroundProps {
    hue?: number;
    backgroundFilter: string;
    coverUrl?: string;
}

const usePlaylistBackground = ({ hue, backgroundFilter, coverUrl }: PlaylistBackgroundProps) => {
    // Memoize the gradient string creation
    const createGradientString = useCallback((colors: [string, string]) => {
        const primaryColor = colors[0] || "#ff0000";
        const secondaryColor = colors[1] || "#202020";
        return `linear-gradient(13deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
    }, []);

    // Memoize the color extraction function
    const extractGradientFromUrl = useCallback(
        async (url: string) => {
            console.log("Extracting colors from", url);
            const colors = await extractColors(url);
            if (!colors || colors.length === 0) {
                console.error("No colors found", colors);
                return createGradientString(["#272727", "#0f0f0f"]);
            }
            const distinctColors = getDistinctColors(colors);
            return createGradientString(distinctColors);
        },
        [createGradientString]
    );

    // Store the computed gradient
    const [imageGradient, setImageGradient] = useState<string>();

    // Only run color extraction when coverUrl changes
    useEffect(() => {
        if (!coverUrl) return;

        let isMounted = true;

        extractGradientFromUrl(coverUrl)
            .then((gradient) => {
                if (isMounted) {
                    setImageGradient(gradient);
                }
            })
            .catch(console.error);

        return () => {
            isMounted = false;
        };
    }, [coverUrl, extractGradientFromUrl]);

    // Memoize the final gradients object
    const gradients = useMemo(() => {
        const hueGradient = hue !== undefined ? getCssHueGradient(hue) : undefined;

        return {
            gradient: {
                background: hueGradient,
            },
            gradientBackground: {
                background: hueGradient || imageGradient,
                filter: backgroundFilter,
                transition: "background 5s",
            },
            background: {
                filter: backgroundFilter,
            },
        };
    }, [hue, imageGradient, backgroundFilter]);

    return gradients;
};

export default usePlaylistBackground;

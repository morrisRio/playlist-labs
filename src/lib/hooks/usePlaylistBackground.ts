import useSWR from "swr";
import { extractColors } from "extract-colors";
import { getCssHueGradient, getDistinctColors } from "@/lib/utils";

interface PlaylistBackgroundProps {
    hue?: number;
    backgroundFilter: string;
    coverUrl?: string;
}

const createGradientString = (colors: [string, string]) => {
    const primaryColor = colors[0] || "#ff0000";
    const secondaryColor = colors[1] || "#202020";
    return `linear-gradient(13deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
};

const usePlaylistBackground = ({ hue, backgroundFilter, coverUrl }: PlaylistBackgroundProps) => {
    const { data: imageGradient } = useSWR(
        coverUrl ? ["gradient", coverUrl] : null,
        async () => {
            const colors = await extractColors(coverUrl!);
            const distinctColors = getDistinctColors(colors);
            return createGradientString(distinctColors);
        },
        {
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        }
    );

    return {
        gradient: {
            background: hue !== undefined ? getCssHueGradient(hue) : undefined,
        },
        gradientBackground: {
            background: hue !== undefined ? getCssHueGradient(hue) : imageGradient,
            filter: backgroundFilter,
            transition: "background 5s",
        },
        background: {
            filter: backgroundFilter,
        },
    };
};

export default usePlaylistBackground;

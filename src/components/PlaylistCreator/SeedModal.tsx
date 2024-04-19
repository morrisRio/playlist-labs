import { useState, useEffect } from "react";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { SeedEntry, Seed } from "./Seed";
import formatter from "numbuffix";

interface SeedModalProps {
    onAdd: (seed: Seed) => void;
    onClose: () => void;
    seeds: Seed[];
}

const item = {
    external_urls: {
        spotify: "https://open.spotify.com/artist/3meJIgRw7YleJrmbpbJK6S",
    },
    followers: {
        href: null,
        total: 1024352,
    },
    genres: ["hoerspiel"],
    href: "https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S",
    id: "3meJIgRw7YleJrmbpbJK6S",
    images: [
        {
            height: 640,
            url: "https://i.scdn.co/image/ab6761610000e5eb7de827ab626c867816052015",
            width: 640,
        },
        {
            height: 320,
            url: "https://i.scdn.co/image/ab676161000051747de827ab626c867816052015",
            width: 320,
        },
        {
            height: 160,
            url: "https://i.scdn.co/image/ab6761610000f1787de827ab626c867816052015",
            width: 160,
        },
    ],
    name: "Die drei ???",
    popularity: 86,
    type: "artist",
    uri: "spotify:artist:3meJIgRw7YleJrmbpbJK6S",
};

interface Results {
    results: Seed[];
    seedTypes: string[];
    rangeTypes: string[];
    selectedType: "artist" | "track";
    selectedRange: "short_term" | "medium_term" | "long_term";
}

const getDescription = (item: any) => {
    if (item.type === "artist") {
        return `${item.genres.join(", ")} · ${formatter(
            item.followers.total,
            ""
        )} followers`;
    } else {
        // @ts-ignore
        return item.artists.map((artist) => artist.name).join(", ");
    }
};

const getThumbnail = (item: any) => {
    if (item.type === "artist") {
        return item.images[0].url;
    } else {
        // @ts-ignore
        return item.album.images[0].url;
    }
    return "";
};

function SeedModal({ onAdd, onClose, seeds }: SeedModalProps) {
    const [search, setSearch] = useState("Search for an artist or track");
    const [results, setResults] = useState<Results>({
        results: [],
        seedTypes: ["artist", "track"],
        rangeTypes: ["short_term", "medium_term", "long_term"],
        selectedType: "artist",
        selectedRange: "short_term",
    });

    useEffect(() => {
        const fetchResults = async () => {
            const response = await fetch(
                `/api/spotify/top-items/${results.selectedType}s?time_range=${results.selectedRange}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const { data } = await response.json();
            console.log(data.items);
            const seeds = data.items.map((item: any) => {
                const seed: Seed = {
                    spotify: item.external_urls.spotify,
                    id: item.id,
                    title: item.name,
                    description: getDescription(item),
                    type: item.type,
                    thumbnail: getThumbnail(item),
                };
                return seed;
            });
            console.log(seeds);
            setResults((prevState) => ({
                ...prevState,
                results: seeds,
            }));
        };
        fetchResults();
    }, [results.selectedType, results.selectedRange]);

    const changeFilter = (
        e:
            | React.MouseEvent<HTMLButtonElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.currentTarget;
        console.log(name, value);
        setResults((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div className="absolute h-full w-full bg-zinc-950 top-0 left-0 p-8">
            <header className="flex items-center gap-4">
                <button onClick={onClose}>
                    <MdOutlineArrowBackIos size="2em" />
                </button>
                <h1>Add Seed</h1>
                <h3 className="text-zinc-500 text-right flex-grow self-end">
                    {seeds?.length} /5 used
                </h3>
            </header>
            <div id="filters" className="mt-4 mb-6 gap-4">
                <div className="flex justify-between">
                    {results.seedTypes.map((type) => (
                        <button
                            type="button"
                            name="selectedType"
                            value={type}
                            key={type}
                            onClick={changeFilter}
                        >
                            <h4
                                className={`font-bold ${
                                    results.selectedType == type
                                        ? "text-white"
                                        : "text-zinc-500"
                                }`}
                            >
                                Top {type[0].toUpperCase() + type.slice(1)}s
                            </h4>
                        </button>
                    ))}
                    <select
                        name="selectedRange"
                        onChange={changeFilter}
                        className="block mt-1 p-2 rounded-md bg-zinc-800 focus:outline-none focus:ring focus:border-blue-300"
                    >
                        {results.rangeTypes.map((duration) => (
                            <option key={duration} value={duration}>
                                {duration}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className=" flex flex-col">
                {results.results.map((seed, index) => (
                    <SeedEntry
                        seedObj={seed}
                        index={index}
                        onAdd={onAdd}
                        key={seed.id}
                    />
                ))}
            </div>
        </div>
    );
}

export default SeedModal;

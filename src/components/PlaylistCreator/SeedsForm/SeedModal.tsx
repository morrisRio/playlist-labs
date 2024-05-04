import { useState, useEffect, useRef } from "react";
import {
    MdOutlineArrowBackIos,
    MdOutlineSearch,
    MdClose,
} from "react-icons/md";
import { SeedEntry } from "./SeedEntry";
import { Seed } from "@/types/spotify";
import { getSeedsFromItems } from "@/lib/spotifyActions";

interface SeedModalProps {
    onAdd: (seed: Seed) => void;
    onRemove: (id: string) => void;
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
    rangeTypes: string[][];
    selectedType: "artist" | "track";
    selectedRange: "short_term" | "medium_term" | "long_term";
}

const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

function SeedModal({ onAdd, onRemove, onClose, seeds }: SeedModalProps) {
    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<Seed[]>([]);
    const [results, setResults] = useState<Results>({
        results: [],
        seedTypes: ["track", "artist"],
        rangeTypes: [
            ["short_term", "weekly"],
            ["medium_term", "monthly"],
            ["long_term", "6 months"],
        ],
        selectedType: "track",
        selectedRange: "short_term",
    });
    const debouncedSearch = useDebounce(search, 300);
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
            const seeds = getSeedsFromItems(data.items);
            console.log(seeds);
            setResults((prevState) => ({
                ...prevState,
                results: seeds,
            }));
        };
        fetchResults();
    }, [results.selectedType, results.selectedRange]);

    useEffect(() => {
        if (!search) {
            setShowSearch(false);
            return;
        }
        setShowSearch(true);
        const fetchSearch = async () => {
            const response = await fetch(`/api/spotify/search?q=${search}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            // console.log("found: ", data);
            setSearchResults(data);
        };
        fetchSearch();
    }, [debouncedSearch]);

    const inputRef = useRef(null);
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

    const isAdded = (id: string): boolean => {
        return seeds.some((seed) => seed.id === id);
    };

    return (
        <div className="absolute min-h-full w-full bg-gradient top-0 left-0 p-4 z-50">
            <header className="flex items-center gap-4">
                <button onClick={onClose} type="button">
                    <MdOutlineArrowBackIos size="2em" />
                </button>
                <h2>Add Seed</h2>
                <h3 className="text-zinc-500 text-right flex-grow self-end">
                    {seeds?.length} /5 used
                </h3>
            </header>
            <div className="relative mt-8">
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full pb-2 bg-transparent border-b border-b-zinc-500 focus:outline-none focus:border-b-white placeholder-zinc-500 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pb-2">
                    {showSearch ? (
                        <MdClose
                            onClick={() => {
                                setSearch("");
                                setShowSearch(false);
                            }}
                            size="2em"
                            className="cursor-pointer"
                        ></MdClose>
                    ) : (
                        <MdOutlineSearch
                            size="2em"
                            onClick={() => {
                                if (inputRef.current !== null)
                                    //@ts-ignore
                                    inputRef.current.focus();
                            }}
                            className="cursor-pointer"
                        ></MdOutlineSearch>
                    )}
                </div>
            </div>
            {showSearch ? (
                <div className="flex flex-col mt-6">
                    {searchResults.map((seed) => (
                        <SeedEntry
                            seedObj={seed}
                            onAdd={onAdd}
                            onRemove={onRemove}
                            key={seed.id}
                            added={isAdded(seed.id)}
                        />
                    ))}
                </div>
            ) : (
                <>
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
                                    <p
                                        className={`font-bold ${
                                            results.selectedType == type
                                                ? "text-white"
                                                : "text-zinc-400"
                                        }`}
                                    >
                                        Top{" "}
                                        {type[0].toUpperCase() + type.slice(1)}s
                                    </p>
                                </button>
                            ))}
                            <select
                                name="selectedRange"
                                onChange={changeFilter}
                                className="block mt-1 p-2 rounded-md bg-zinc-800 text-zinc-300 focus:outline-none focus:ring focus:border-blue-300 text-xs"
                            >
                                {results.rangeTypes.map((duration) => (
                                    <option
                                        key={duration[0]}
                                        value={duration[0]}
                                    >
                                        {duration[1][0].toUpperCase() +
                                            duration[1].slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className=" flex flex-col">
                        {results.results.map((seed) => (
                            <SeedEntry
                                seedObj={seed}
                                onAdd={onAdd}
                                onRemove={onRemove}
                                added={isAdded(seed.id)}
                                key={seed.id}
                            />
                            // delete deltes index not seed itself => refactor
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default SeedModal;

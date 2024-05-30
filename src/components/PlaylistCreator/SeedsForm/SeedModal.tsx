import { useState, useEffect, useRef } from "react";
import { MdOutlineArrowBackIos, MdOutlineSearch, MdClose } from "react-icons/md";
import { SeedEntry } from "./SeedEntry";
import { Seed } from "@/types/spotify";
import { getSeedsFromItems } from "@/lib/spotifyUtils";

import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "@/../tailwind.config";

interface SeedModalProps {
    onAdd: (seed: Seed) => void;
    onRemove: (id: string) => void;
    onClose: () => void;
    seeds: Seed[];
}

interface SelectionTops {
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
    const fullConfig = resolveConfig(tailwindConfig);
    //@ts-expect-error
    const interactColor = fullConfig.theme.colors.themetext["DEFAULT"] + "a8"; //a8 is 65% opacity

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [searchResults, setSearchResults] = useState<Seed[]>([]);
    const [selectedTops, setSelectedTops] = useState<SelectionTops>({
        selectedType: "track",
        selectedRange: "short_term",
    });
    const selectOptions = {
        seedTypes: ["track", "artist"],
        rangeTypes: [
            ["short_term", "weekly"],
            ["medium_term", "monthly"],
            ["long_term", "6 months"],
        ],
    };
    const debouncedSearch = useDebounce(search, 300);
    useEffect(() => {
        const fetchResults = async () => {
            const response = await fetch(
                `/api/spotify/top-items/${selectedTops.selectedType}s?time_range=${selectedTops.selectedRange}`,
                {
                    method: "GET",
                }
            );
            const { data } = await response.json();
            const seeds = getSeedsFromItems(data.items);
            setSearchResults(seeds);
        };
        if (!showSearch) fetchResults();
    }, [selectedTops.selectedType, selectedTops.selectedRange, showSearch]);

    useEffect(() => {
        if (!search) {
            setShowSearch(false);
            return;
        }
        setShowSearch(true);
        const fetchSearch = async () => {
            const response = await fetch(`/api/spotify/search?q=${search}`, {
                method: "GET",
            });
            const data = await response.json();
            setSearchResults(data);
        };
        fetchSearch();
    }, [debouncedSearch]);

    const inputRef = useRef(null);
    const changeFilter = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setSelectedTops((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const isAdded = (id: string): boolean => {
        return seeds.some((seed) => seed.id === id);
    };

    return (
        <div className="bg-ui-950 absolute min-h-full w-full top-0 left-0 p-4 z-50">
            <header className="flex items-center gap-4">
                <button onClick={onClose} type="button">
                    <MdOutlineArrowBackIos size="2em" />
                </button>
                <h2>Add Seed</h2>
                <h3 className="text-ui-600 font-normal text-right flex-grow self-end">{seeds?.length} /5 used</h3>
            </header>
            <div className="relative mt-8">
                <input
                    ref={inputRef}
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full p-3 bg-ui-800 rounded-lg focus:outline-none placeholder-ui-600 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center p-2">
                    {showSearch ? (
                        <MdClose
                            onClick={() => {
                                setSearch("");
                                setShowSearch(false);
                            }}
                            color={interactColor}
                            size="2em"
                            className="cursor-pointer"
                        ></MdClose>
                    ) : (
                        <MdOutlineSearch
                            size="2em"
                            color={interactColor}
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
            {!showSearch && (
                <>
                    <div id="filters" className="mt-4 mb-6 gap-4">
                        <div className="flex justify-between">
                            {selectOptions.seedTypes.map((type) => (
                                <button
                                    type="button"
                                    name="selectedType"
                                    value={type}
                                    key={type}
                                    onClick={changeFilter}
                                >
                                    <h4
                                        className={`${
                                            selectedTops.selectedType == type ? "text-white" : "text-ui-600"
                                        } font-semibold`}
                                    >
                                        Top {type[0].toUpperCase() + type.slice(1)}s
                                    </h4>
                                </button>
                            ))}
                            <select
                                name="selectedRange"
                                onChange={changeFilter}
                                className="block mt-1 p-2 rounded-lg bg-ui-800 text-themetext/60 focus:outline-none focus:ring focus:border-themetext text-sm"
                            >
                                {selectOptions.rangeTypes.map((duration) => (
                                    <option key={duration[0]} value={duration[0]}>
                                        {duration[1][0].toUpperCase() + duration[1].slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}
            <div className="flex flex-col mt-6 gap-4">
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
        </div>
    );
}

export default SeedModal;

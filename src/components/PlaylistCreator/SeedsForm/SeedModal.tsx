import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MdOutlineArrowBackIos, MdOutlineSearch, MdClose } from "react-icons/md";
import { SeedEntry } from "./SeedEntry";
import { Seed } from "@/types/spotify";
import { getSeedsFromItems } from "@/lib/spotifyUtils";
import useSWR from "swr";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import { set } from "mongoose";

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
    const fetcher = (url: string) => {
        const abortController = new AbortController();
        const promise = fetch(url, { signal: abortController.signal }).then((r) => r.json());
        //@ts-ignore
        promise.abort = () => abortController.abort();
        return promise;
    };

    //make the modal stick to the top and disable scrolling on window
    //scrolling is only enabled on the search results
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const [search, setSearch] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    // const [searchResults, setSearchResults] = useState<Seed[]>([]);
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

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const debouncedSearch = useDebounce(search, 300);

    const isAdded = useMemo(() => {
        return (id: string): boolean => {
            return seeds.some((seed) => seed.id === id);
        };
    }, [seeds]);

    const { data: topItems, error: topItemsError } = useSWR(
        !showSearch
            ? `/api/spotify/top-items/${selectedTops.selectedType}s?time_range=${selectedTops.selectedRange}`
            : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 300,
            suspense: true,
        }
    );

    // Process topItems into seeds
    const topItemSeeds = useMemo(() => {
        console.log("topItemsMemo");
        if (topItems && topItems.data && topItems.data.items) {
            return getSeedsFromItems(topItems.data.items);
        }
        return [];
    }, [topItems]);

    const { data: searchResults, error: searchError } = useSWR(
        showSearch && debouncedSearch ? `/api/spotify/search?q=${debouncedSearch}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 300,
            suspense: true,
        }
    );
    const memoizedSeeds = useMemo(() => {
        return (searchResults || topItemSeeds).map((seed: Seed) => (
            <SeedEntry seedObj={seed} onAdd={onAdd} onRemove={onRemove} key={seed.id} added={isAdded(seed.id)} />
        ));
    }, [searchResults, topItemSeeds, onAdd, onRemove, isAdded]);

    useEffect(() => {
        setShowSearch(search.length > 0);
    }, [search]);

    const inputRef = useRef(null);
    const changeFilter = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.currentTarget;
        setSelectedTops((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const error = searchError || topItemsError;
    const loading = error ? !error : searchResults ? searchResults.length <= 0 : topItems ? topItems.length <= 0 : true;

    return (
        <div className="bg-ui-950 fixed h-screen w-full top-0 left-0 z-50 flex flex-col">
            <header className="border-b border-ui-700 flex flex-col gap-4 p-4 bg-ui-900">
                <div className="flex items-center gap-2">
                    <button onClick={onClose} type="button">
                        <MdOutlineArrowBackIos />
                    </button>
                    <h3>Add Seed</h3>
                    <h3 className="text-ui-600 font-normal text-right flex-grow self-end">{seeds?.length} /5 used</h3>
                    <button onClick={onClose} type="button">
                        Done
                    </button>
                </div>
                <div className="relative -mx-4">
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search"
                        className="w-full px-5 py-3 bg-ui-850 focus:outline-none placeholder-ui-600 text-lg  border-y border-ui-700"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center p-2 text-themetext/65">
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
                {!showSearch && (
                    <div className="gap-4">
                        <div className="flex justify-between">
                            {selectOptions.seedTypes.map((type) => (
                                <button
                                    type="button"
                                    name="selectedType"
                                    value={type}
                                    key={type}
                                    onClick={changeFilter}
                                >
                                    <h5
                                        className={`${
                                            selectedTops.selectedType == type ? "text-white" : "text-ui-600"
                                        }`}
                                    >
                                        Top {type[0].toUpperCase() + type.slice(1)}s
                                    </h5>
                                </button>
                            ))}
                            <select
                                name="selectedRange"
                                onChange={changeFilter}
                                className="block mt-1 p-2 rounded-lg bg-ui-800 text-b6b6b6 focus:outline-none focus:ring focus:border-themetext text-xs text-ui-600"
                            >
                                {selectOptions.rangeTypes.map((duration) => (
                                    <option key={duration[0]} value={duration[0]}>
                                        {duration[1][0].toUpperCase() + duration[1].slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </header>
            <div className="relative flex flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 size-full">
                {memoizedSeeds}
                {loading && (
                    <div className="absolute inset-0 flex justify-center pt-16 size-full bg-ui-900/20">
                        <Lottie animationData={Loading} className="size-20"></Lottie>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex justify-center pt-16 size-full bg-ui-900/20">
                        <p>Error loading data</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeedModal;

import { useState, useEffect, useRef, useCallback, useMemo, use } from "react";
import useSWR from "swr";
import type { Key, SWRConfiguration, SWRResponse } from "swr";

import MemoizedSearchBar from "./SearchBar";
import { SeedEntry } from "./SeedEntry";

import { Seed } from "@/types/spotify";

import { MdOutlineArrowBackIos, MdCheck, MdKeyboardArrowDown } from "react-icons/md";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";

import { useEscapeKey } from "@/lib/hooks/useEscapeKey";

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

function SeedModal({ onAdd, onRemove, onClose, seeds }: SeedModalProps) {
    //make the modal stick to the top and disable scrolling on window
    //scrolling is only enabled on the search results
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const isAdded = useMemo(() => {
        return (id: string): boolean => {
            return seeds.some((seed) => seed.id === id);
        };
    }, [seeds]);

    const fetcher = (url: string, controller: AbortController) => {
        const promise = fetch(url, { signal: controller.signal }).then(async (r) => {
            if (!r.ok) {
                const error = new Error("An error occurred while fetching the data.");
                // Attach extra info to the error object.
                error.message = await r.json();
                throw error;
            }
            return await r.json();
        });

        return promise;
    };

    const abortControllerRef = useRef<AbortController | null>(null);
    const [controller, setController] = useState<AbortController | null>(new AbortController());

    function useCancellableSWR(key: Key, opts: SWRConfiguration): SWRResponse {
        useEffect(() => {
            if (key) {
                setController(new AbortController());

                abortControllerRef.current?.abort();

                abortControllerRef.current = controller;
                return () => {
                    abortControllerRef.current?.abort();
                };
            }
        }, [key]);

        return useSWR(key, (url: string) => (controller ? fetcher(url, controller) : null), opts);
    }

    //SEARCH ______________________________________________________________________________________________________________
    const [search, setSearch] = useState("");

    const [showSearch, setShowSearch] = useState(false);
    const handleSetSearch = useCallback((value: string) => {
        if (value.length > 0) {
            setSearch(value);
            setShowSearch(true);
        } else {
            setSearch("");
            setShowSearch(false);
        }
    }, []);

    const {
        data: searchResults,
        error: searchError,
        isLoading: searchLoading,
    } = useCancellableSWR(showSearch && search ? `/api/spotify/search?q=${search}` : null, {
        revalidateOnFocus: false,
        dedupingInterval: 290,
        keepPreviousData: true,
    });

    //TOP_ITEMS ______________________________________________________________________________________________________________
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
    const {
        data: topItems,
        error: topItemsError,
        isLoading: topLoading,
    } = useCancellableSWR(
        !showSearch
            ? `/api/spotify/top-items/${selectedTops.selectedType}s?time_range=${selectedTops.selectedRange}`
            : null,
        {
            revalidateOnFocus: false,
            dedupingInterval: 290,
            keepPreviousData: true,
        }
    );

    const changeFilter = (e: React.MouseEvent<HTMLButtonElement> | React.ChangeEvent<HTMLSelectElement>) => {
        // controllerTop.abort();
        const { name, value } = e.currentTarget;
        setSelectedTops((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const error = searchError || topItemsError;
    const loading = searchLoading || topLoading;

    const memoizedSeeds = useMemo(() => {
        if (
            error ||
            (showSearch && (!searchResults || searchResults.length === 0) && !searchLoading) ||
            (!showSearch && (!topItems || topItems.length === 0) && !topLoading)
        ) {
            return <div className="text-ui-600 text-center">An error occurred. Please try again later.</div>;
        }

        try {
            return (showSearch ? searchResults : topItems).map((seed: Seed, index: number) => (
                <SeedEntry
                    seedObj={seed}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    key={seed.id}
                    added={isAdded(seed.id)}
                    isAboveTheFold={index < 16}
                />
            ));
        } catch {
            return false;
        }
    }, [searchResults, topItems, onAdd, onRemove, isAdded, error, showSearch, searchLoading, topLoading]);

    useEscapeKey(onClose);

    const selectStyle =
        "p-2 px-3 rounded-lg bg-ui-800 text-ui-500 focus:outline-none focus:ring focus:border-themetext text-sm appearance-none pr-6";

    return (
        <>
            <div
                className="bg-ui-800/30 fixed top-0 left-0 w-screen h-screen z-50 sm:backdrop-blur-[1px] sm:backdrop-brightness-75"
                onClick={onClose}
            ></div>
            <div className="bg-ui-950 fixed h-screen overflow-hidden max-sm:w-full top-0 max-sm:left-0 z-50 flex flex-col sm:w-[42rem] lg:w-[52rem] sm:-mx-16 sm:my-14 sm:rounded-2xl  sm:max-h-[max(calc(100vh-8rem),30rem)] sm:border-ui-700 sm:border">
                <div className="border-b border-ui-700 flex flex-col gap-4 p-4 bg-ui-900">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} type="button">
                            <MdOutlineArrowBackIos />
                        </button>
                        <h3>Add Seed</h3>
                        <h3 className="text-ui-600 font-normal text-right flex-grow self-end">
                            {seeds?.length} /5 used
                        </h3>
                        <button onClick={onClose} type="button">
                            <MdCheck size="1.7rem" />
                        </button>
                    </div>
                    <MemoizedSearchBar setSearch={handleSetSearch} />
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
                                <label htmlFor="selectRange" className="flex relative items-center">
                                    <select name="selectedRange" onChange={changeFilter} className={selectStyle}>
                                        {selectOptions.rangeTypes.map((duration) => (
                                            <option key={duration[0]} value={duration[0]}>
                                                {duration[1][0].toUpperCase() + duration[1].slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-1 pointer-events-none">
                                        <MdKeyboardArrowDown></MdKeyboardArrowDown>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
                <div className="relative flex flex-col gap-4 overflow-y-auto overflow-x-hidden p-4 size-full">
                    {memoizedSeeds}
                    {loading && (
                        <div className="absolute z-50 inset-0 flex justify-center pt-16 size-full bg-ui-900/40">
                            <Lottie animationData={Loading} className="size-20"></Lottie>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default SeedModal;

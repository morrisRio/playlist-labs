import { useState, useEffect, useRef, useCallback, useMemo, use } from "react";
import { MdOutlineArrowBackIos, MdOutlineSearch, MdClose, MdCheck } from "react-icons/md";
import { SeedEntry } from "./SeedEntry";
import { Seed } from "@/types/spotify";
import useSWR, { mutate } from "swr";
import type { Key, SWRConfiguration, SWRResponse } from "swr";

import Lottie from "lottie-react";
import Loading from "@/lib/lotties/loading.json";
import debounce from "lodash/debounce";
import { set } from "lodash";

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

const useDebounce = (callback: () => void) => {
    const ref = useRef<() => void>();

    useEffect(() => {
        ref.current = callback;
    }, [callback]);

    const debouncedCallback = useMemo(() => {
        const func = () => {
            ref.current?.();
        };

        return debounce(func, 500);
    }, []);

    return debouncedCallback;
};

function SearchBar({
    setSearch,
    showSearch,
    setShowSearch,
}: {
    // setNewSearch: (value: string) => void;
    setSearch: (value: string) => void;
    showSearch: boolean;
    setShowSearch: (state: boolean) => void;
}) {
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");

    const debouncedSearch = useDebounce(() => {
        if (query.length > 0) {
            setSearch(query);
            setShowSearch(true);
        } else {
            setShowSearch(false);
        }
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        debouncedSearch();
    };

    return (
        <div className="relative -mx-4">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={onChange}
                placeholder="Search"
                className="w-full px-5 py-3 bg-ui-850 focus:outline-none placeholder-ui-600 text-lg  border-y border-ui-700"
            />
            <div className="absolute inset-y-0 right-0 flex items-center p-2 text-themetext/65">
                {showSearch ? (
                    <MdClose
                        onClick={() => {
                            setQuery("");
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
    );
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

    const { data: searchResults, error: searchError } = useCancellableSWR(
        showSearch && search ? `/api/spotify/search?q=${search}` : null,
        {
            revalidateOnFocus: false,
            dedupingInterval: 290,
            suspense: true,
        }
    );

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
    const { data: topItems, error: topItemsError } = useCancellableSWR(
        !showSearch
            ? `/api/spotify/top-items/${selectedTops.selectedType}s?time_range=${selectedTops.selectedRange}`
            : null,
        {
            revalidateOnFocus: false,
            dedupingInterval: 290,
            suspense: true,
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
    const loading = error ? !error : searchResults ? searchResults.length <= 0 : topItems ? topItems.length <= 0 : true;

    const memoizedSeeds = useMemo(() => {
        if (loading || error) return;
        try {
            console.log(topItems);
            return (searchResults || topItems).map((seed: Seed, index: number) => (
                <SeedEntry
                    seedObj={seed}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    key={seed.id}
                    added={isAdded(seed.id)}
                    isAboveTheFold={index < 12}
                />
            ));
        } catch {
            return false;
        }
    }, [searchResults, topItems, onAdd, onRemove, isAdded, error, loading]);

    return (
        <div className="bg-ui-950 fixed h-screen w-full top-0 left-0 z-50 flex flex-col">
            <header className="border-b border-ui-700 flex flex-col gap-4 p-4 bg-ui-900">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} type="button">
                        <MdOutlineArrowBackIos />
                    </button>
                    <h3>Add Seed</h3>
                    <h3 className="text-ui-600 font-normal text-right flex-grow self-end">{seeds?.length} /5 used</h3>
                    <button onClick={onClose} type="button">
                        <MdCheck size="1.7rem" />
                    </button>
                </div>
                <SearchBar
                    // setNewSearch={setNewSearch}
                    showSearch={showSearch}
                    setShowSearch={setShowSearch}
                    setSearch={setSearch}
                ></SearchBar>
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
                {/* {searchResults && searchResults.length > 0 && <p>searchResults[0].</p>} */}
                {loading && (
                    <div className="absolute inset-0 flex justify-center pt-16 size-full bg-ui-900/20">
                        <Lottie animationData={Loading} className="size-20"></Lottie>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 flex justify-center pt-16 size-full bg-ui-900/20">
                        <p>
                            Error loading data
                            <br />
                        </p>
                        {searchError && (
                            <p>
                                searchError: {searchError.toString()}
                                <br />
                            </p>
                        )}

                        {topItemsError && (
                            <p>
                                topItemsError: {topItemsError.toString()}
                                <br />
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SeedModal;

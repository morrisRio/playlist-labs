import { useCallback, useMemo, useRef, useState, memo } from "react";
import { MdClose, MdOutlineSearch } from "react-icons/md";

const debounce = (func: (arg0: string) => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (val: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(val), delay);
    };
};

function SearchBar({ setSearch }: { setSearch: (value: string) => void }) {
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");

    const debouncedSetSearch = useMemo(() => debounce((value) => setSearch(value), 500), [setSearch]);
    
    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            debouncedSetSearch(e.target.value);
        },
        [debouncedSetSearch]
    );

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
                {query.length > 0 ? (
                    <MdClose
                        onClick={() => {
                            setQuery("");
                            setSearch("");
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

export default memo(SearchBar);
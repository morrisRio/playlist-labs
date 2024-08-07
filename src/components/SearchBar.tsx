function SearchBar({
    setSearch,
    showSearch,
    setShowSearch,
}: {
    setSearch: (value: string) => void;
    showSearch: boolean;
    setShowSearch: (state: boolean) => void;
}) {
    const inputRef = useRef(null);

    const [query, setQuery] = useState("");

    const handleQueryChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setQuery(e.target.value);
            setSearch(e.target.value);
        },
        [setQuery, setSearch]
    );

    // const debouncedSearch = useDebounce(query, 300);

    // useEffect(() => {
    //     if (debouncedSearch.length > 0) {
    //         setShowSearch(true);
    //         setSearch(debouncedSearch);
    //     } else {
    //         setShowSearch(false);
    //     }
    // }, [debouncedSearch, setSearch, setShowSearch]);

    return (
        <div className="relative -mx-4">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
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
    );
}

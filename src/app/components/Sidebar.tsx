import React from "react";
import {
    MdOutlineHome,
    MdOutlineAdd,
    MdOutlineSearch,
    MdFavoriteBorder,
    MdOutlineLibraryMusic,
} from "react-icons/md";

const Sidebar = () => {
    return (
        <div className="bg-gray-800 flex flex-col gap-4 p-4">
            <h1>Sidebar with icons</h1>
            <button className="flex items-center gap-2">
                <MdOutlineHome />
                Home
            </button>
            <button className="flex items-center gap-2">
                <MdOutlineSearch />
                Search
            </button>
            <button className="flex items-center gap-2">
                <MdOutlineAdd />
                New Session
            </button>
            <hr />
            <button className="flex items-center gap-2">
                <MdFavoriteBorder />
                Likes
            </button>
            <button className="flex items-center gap-2">
                <MdOutlineLibraryMusic />
                Your Sessions
            </button>
            <hr />
            {/* playlists */}
            <p>Playlist 1</p>
            <p>Playlist 2</p>
            <p>Playlist 3</p>
            <p>Playlist 4</p>
        </div>
    );
};

export default Sidebar;

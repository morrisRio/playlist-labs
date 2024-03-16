// import {
//     MdOutlineHome,
//     MdOutlineAdd,
//     MdOutlineSearch,
//     MdFavoriteBorder,
//     MdOutlineLibraryMusic,
// } from "react-icons/md";
import Profile from "@/components/Profile";
import { getUserPlaylist } from "@/lib/spotifyActions";
import { getAuthSession } from "@/lib/serverUtils";
import { redirect } from "next/navigation";

const Sidebar = async () => {
    const session = await getAuthSession();
    console.log("session in Sidebar (server-component):", session);
    if (!session) {
        redirect("api/auth/signin");
    }

    const playlists = await getUserPlaylist(session);
    // console.log("playlists", playlists);
    return (
        <div className=" text-neutral-300 border border-neutral-700 flex flex-col gap-4 p-4 overflow-y-auto scrollbar-hide">
            <Profile />

            <h3>
                {/* Playlists from {session ? session?.user?.name : "Unknown User"} */}
                Playlists
            </h3>
            {playlists?.map((playlist) => {
                return <p key={playlist.id}>{playlist.name}</p>;
            })}
        </div>
    );
};

export default Sidebar;

{
    /* <h4>Sidebar with icons</h4>
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
            <hr /> */
}
{
    /* playlists */
}

import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import Profile from "@/components/Profile";
import Link from "next/link";
import { MdChevronLeft } from "react-icons/md";

export default async function createPlaylist() {
    return (
        <div className="h-full w-full flex flex-col gap-4">
            <div className="flex items-center">
                <Link href="/" replace={true}>
                    <MdChevronLeft size="2rem"></MdChevronLeft>
                </Link>
                <h3> Create Playlist</h3>
            </div>
            <PlaylistCreator></PlaylistCreator>
        </div>
    );
}

import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import Profile from "@/components/Profile";
import Link from "next/link";
import { MdChevronLeft } from "react-icons/md";
// import Center from "@/components/Dashboard";

export default async function Home() {
    return (
        <div className="h-full w-full p-3 flex flex-col gap-4">
            <div className="flex items-center">
                <Link href="/">
                    <MdChevronLeft size="2rem"></MdChevronLeft>
                </Link>
                <h2> Create Playlist</h2>
            </div>
            <PlaylistCreator></PlaylistCreator>
            <Profile></Profile>
        </div>
    );
}

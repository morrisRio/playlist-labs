import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import Profile from "@/components/Profile";
// import Center from "@/components/Dashboard";

export default async function Home() {
    return (
        <div className="h-full w-full">
            <PlaylistCreator></PlaylistCreator>
            <Profile></Profile>
        </div>
    );
}

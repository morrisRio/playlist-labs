import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";

export default async function createPlaylist() {
    return (
        <div className="h-full w-full">
            <PlaylistCreator pageTitle="New Playlist"></PlaylistCreator>
        </div>
    );
}

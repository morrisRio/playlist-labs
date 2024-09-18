import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";
import { auth } from "@/lib/serverUtils";
import { redirect } from "next/navigation";

export default async function createPlaylist() {
    const session = await auth("page");
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }
    return (
        <div className="min-h-full w-full">
            <PlaylistCreator pageTitle="New Playlist"></PlaylistCreator>
        </div>
    );
}

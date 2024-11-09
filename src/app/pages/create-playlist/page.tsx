import { redirect } from "next/navigation";

import { auth } from "@/lib/serverUtils";

import PlaylistEditor from "@/components/PlaylistCreator/PlaylistEditor";
import ClientSessionProvider from "@/components/ClientSessionProvider";

export default async function createPlaylist() {
    const session = await auth("page");
    if (!session || !session.user || !session.user.id) {
        console.error("No session found");
        redirect("/api/auth/signin");
    }
    return (
        <div className="min-h-full w-full">
            <ClientSessionProvider session={session}>
                <PlaylistEditor pageTitle="New Playlist"></PlaylistEditor>
            </ClientSessionProvider>
        </div>
    );
}

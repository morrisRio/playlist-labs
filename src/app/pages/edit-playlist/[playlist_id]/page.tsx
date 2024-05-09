import { connectMongoDB } from "@/lib/db/dbConnect";
import User from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Playlist } from "@/types/spotify";
import PlaylistCreator from "@/components/PlaylistCreator/PlaylistCreator";

async function EditPlaylist({ params }: { params: { playlist_id: string } }) {
    async function getPlaylist(playlist_id: string): Promise<Playlist | null> {
        //for fetching only one playlist: https://www.mongodb.com/docs/manual/tutorial/optimize-query-performance-with-indexes-and-projections/
        const session = await getServerSession(authOptions);
        await connectMongoDB();

        //fetch playlist from db
        if (session && session.user && session.user.id) {
            //TODO: get rid of _id's in the response
            const { id } = session.user;
            console.log("Session: ", session);
            //projection to only get the playlist with the id

            //could also unwind the user first and then match the playlist
            const { playlists } = (await User.findOne(
                { spotify_id: id },
                {
                    playlists: { $elemMatch: { playlist_id: playlist_id } },
                    _id: 0,
                }
            ).lean()) as { playlists: Playlist[] };

            return playlists[0];
        } else {
            console.error("Session Error: ", session);
            return null;
        }
    }

    const { playlist_id } = params;
    const playlist = await getPlaylist(playlist_id);

    console.log("Playlist: ", playlist);

    return (
        <div>
            {playlist && (
                <PlaylistCreator playlist={playlist}></PlaylistCreator>
            )}
        </div>
    );
}

export default EditPlaylist;

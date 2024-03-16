//TODO: Look at this: https://stackoverflow.com/questions/75418329/how-do-you-put-api-routes-in-the-new-app-folder-of-next-js
//TODO: Look at this: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating
//TODO: Look at this: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
//TODO: Look at this: https://refine.dev/blog/next-js-api-routes/#dynamic-api-routes

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = await getToken({ req });
    console.log("token", token);
    //append the token to the request
    //look at server functions. soonst ist das doppelt und dreifach gefetcht
    const body = {
        name: "playlistName",
        description: "description",
        public: false,
    };

    const res = await fetch(
        `https://api.spotify.com/v1/users/karate_morris/playlists`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token?.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        }
    )
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
            }
            return res.json();
        })
        .catch((error) => {
            console.error("Error creating Playlist:", error);
            return null;
        });
    //const res = await fetch(req).then((res) => res.json());

    return res;
}

// export const customPost = async (url: string, body: object) => {
//     "use server";
//     const session = await getAuthSession();

//     if (!session) {
//         console.error("No session found");
//         return null;
//     }

//     const res = await fetch(url, {
//         method: "POST",
//         headers: {
//             Authorization: `Bearer ${session.accessToken}`,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//     })
//         .then((res) => {
//             if (!res.ok) {
//                 throw new Error("Network response was not ok");
//             }
//             return res.json();
//         })
//         .catch((error) => {
//             console.error("Error creating Playlist:", error);
//             return null;
//         });
//     return res;
// };

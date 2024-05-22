//TODO: PRODUCTION delete endpoint as ill just store the genre array

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { spotifyGet } from "@/lib/serverUtils";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest): Promise<NextResponse> {
    console.log("GETTING GENRES");

    //add the token to the request for the api call
    const token = await getToken({ req });
    if (!token) {
        console.error("No token found");
        return new NextResponse("No token found", { status: 401 });
    }

    const accessToken = token?.accessToken || "no token found";

    //make the api call to create the playlist
    const res = await spotifyGet(
        `https://api.spotify.com/v1/recommendations/available-genre-seeds`,
        accessToken
    );
    //@ts-ignore
    const { genres } = res;

    return NextResponse.json(genres);
}

// function for including the genres into the search endpoint with lehvenstein distance
//https://stackoverflow.com/questions/22876890/find-word-with-mistakes-in-string

//should first get the genre seeds and then compare the genre seeds with the search query, but only for the amount of entered characters
// function levenshteinDistance(s, t) {
//     if (!s.length) return t.length;
//     if (!t.length) return s.length;

//     return Math.min(
//         levenshteinDistance(s.substr(1), t) + 1,
//         levenshteinDistance(t.substr(1), s) + 1,
//         levenshteinDistance(s.substr(1), t.substr(1)) +
//             (s.charAt(0).toLowerCase() !== t.charAt(0).toLowerCase() ? 1 : 0)
//     );
// }

// var testStrings = [
//     "People are afraid of monters.",
//     "Mansters are very scary, even in the daytime",
//     "I like mnsters.",
//     "I like a big, scary monser",
// ];

// var candidateWord = "monsters";
// var words;
// var results = [];
// for (var i = 0; i < testStrings.length; i++) {
//     words = testStrings[i].split(/[\s.,<>;:'"{}\[\]]+/);
//     for (var j = 0; j < words.length; j++) {
//         if (words[j]) {
//             results.push({
//                 word: words[j],
//                 score: levenshteinDistance(words[j], candidateWord),
//             });
//         }
//     }
// }

import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";

async function refreshAccessToken(token: JWT) {
    try {
        console.log("REFRESHING TOKEN");
        if (!token.refreshToken) throw new Error("NO_REFRESH_TOKEN_PROVIDED");
        //get new access token
        const url = "https://accounts.spotify.com/api/token";
        const response: any = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.SPOTIFY_ID +
                            ":" +
                            process.env.SPOTIFY_SECRET
                    ).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedToken = await response.json();

        if (!response.ok) throw new Error("NETWORK RESPONSE ERROR");

        console.log("REFRESHED TOKEN");

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
            //keep old refresh token if new one is not provided
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        //null if something went wrong -> user will be redirected to sign in page
        console.error("CATCHED REFRESH TOKEN ERROR", error);
        return null;
    }
}

const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-private",
    "user-read-playback-position",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "app-remote-control",
    "user-top-read",
    "user-read-recently-played",
    "user-library-read",
    "user-read-email",
];

const params = {
    scope: scopes.join(" "),
};

const LOGIN_URL =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams(params).toString();

export const authOptions: NextAuthOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_ID ?? "",
            clientSecret: process.env.SPOTIFY_SECRET ?? "",
            authorization: LOGIN_URL,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/signin",
    },
    callbacks: {
        // // da kommt viel raus was man nicht sieht:
        // async jwt(data) {
        //   console.log(data);
        //   return data;
        // },

        async jwt({ token, account }) {
            //on first sign in add the tokens from account to jwt
            if (account) {
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    username: account.providerAccountId,
                    accessTokenExpires: account.expires_at,
                };
            }

            //return previous token if it hasn't expired yet
            if (
                token.accessTokenExpires &&
                Date.now() < token.accessTokenExpires
            ) {
                console.log("USING_OLD_TOKEN");
                return token;
            }

            // //access token has expired, try to update it
            let refreshToken = await refreshAccessToken(token);
            return refreshToken;
        },

        async session({ session, token }) {
            //add the token to the session so the user can tap into it and use it for requests
            session.accessToken = token.accessToken;
            session.expires_in = token.accessTokenExpires
                ? ((token.accessTokenExpires - Date.now()) / 60000).toFixed(1) +
                  "min"
                : "0min";
            return session;
        },
    },
};
export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

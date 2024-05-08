import NextAuth, { NextAuthOptions, Account, User, Awaitable } from "next-auth";
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
        // async jwt(all) {
        //   console.log(all);
        //   return all;
        // },
        async signIn({
            user,
            account,
        }: {
            user: User;
            account: Account | null;
        }): Promise<string | boolean> {
            console.log("SIGNIN USER", user);
            //create user in database if he doesn't exist
            if (account?.provider === "spotify") {
                try {
                    console.log("TRYING FETCH");
                    const res = await fetch(
                        `${process.env.NEXTAUTH_URL}/api/db/user`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                spotify_id: user.id,
                                name: user.name,
                            }),
                        }
                    );
                    console.log("SIGNIN RESPONSE", res.statusText);
                    if (!res.ok) throw new Error("SIGNIN ERROR");
                    return true;
                } catch (error) {
                    console.error("SIGNIN ERROR", error);
                    return "SIGNIN_ERROR";
                }
            }
            console.error("SIGNIN_ERROR: PROVIDER_NOT_SUPPORTED");
            return "SIGNIN_ERROR_PROVIDER_NOT_SUPPORTED";
        },

        async jwt({
            token,
            account,
        }: {
            token: JWT;
            account: Account | null;
            user: User;
        }): Promise<JWT> {
            //on first sign in add the tokens from account to jwt
            if (account) {
                console.log("USING_NEW_TOKEN");
                return {
                    ...token,
                    accessToken: account.access_token,
                    refreshToken: account.refresh_token,
                    userId: account.providerAccountId,
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
            let refreshToken = (await refreshAccessToken(token)) as JWT;
            return refreshToken;
        },

        async session({ session, token }) {
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

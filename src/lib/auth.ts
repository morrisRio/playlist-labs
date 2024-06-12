import { NextAuthOptions, Account, User } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { dbRegisterUser } from "@/lib/db/dbActions";
import { JWT } from "next-auth/jwt";
import { debugLog, setDebugMode } from "./logger";
import { debug } from "console";

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

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();

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
        async signIn({ user, account }: { user: User; account: Account | null }): Promise<string | boolean> {
            //create user in database if he doesn't exist
            if (account?.provider !== "spotify") {
                console.error("SIGNIN_ERROR: PROVIDER_NOT_SUPPORTED");
                return false;
            }

            if (!user.name) {
                console.error("SIGNIN_ERROR: NO_NAME_PROVIDED");
                return false;
            }

            return dbRegisterUser(user.id, user.name);
        },

        async jwt({ token, account }: { token: JWT; account: Account | null; user: User }): Promise<JWT> {
            setDebugMode(false);

            //on first sign in add the tokens from account to jwt
            if (account) {
                debugLog("FIRST SIGN IN");
                return {
                    ...token,
                    accessToken: account.access_token!,
                    refreshToken: account.refresh_token!,
                    userId: account.providerAccountId,
                    accessTokenExpires: account.expires_at!,
                };
            }

            //return previous token if it hasn't expired yet
            if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
                debugLog("TOKEN STILL VALID");
                return token;
            }

            // //access token has expired, try to update it
            let refreshToken = (await refreshAccessToken(token)) as JWT;
            return refreshToken;
        },

        async session({ session, token }) {
            session.user.id = token.userId;
            session.expires_in = token.accessTokenExpires
                ? ((token.accessTokenExpires - Date.now()) / 60000).toFixed(1) + "min"
                : "0min";
            return session;
        },
    },
};

async function refreshAccessToken(token: JWT) {
    try {
        debugLog("REFRESHING TOKEN");
        if (!token.refreshToken) throw new Error("NO_REFRESH_TOKEN_PROVIDED");

        //get new access token
        const url = "https://accounts.spotify.com/api/token";
        const response: any = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(process.env.SPOTIFY_ID + ":" + process.env.SPOTIFY_SECRET).toString("base64"),
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshedToken = await response.json();

        if (!response.ok) throw new Error("NETWORK RESPONSE ERROR");

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

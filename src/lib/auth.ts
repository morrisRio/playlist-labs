import { NextAuthOptions, Account, User } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { dbGetAccountByUserId, dbRegisterUser } from "@/lib/db/dbActions";
import { JWT } from "next-auth/jwt";
import { debugLog, setDebugMode } from "./utils";
import { MongoAccount } from "@/types/spotify";

//scopes for future use
// "user-read-playback-position",
//     "user-read-playback-state",
//     "user-modify-playback-state",
//     "user-read-currently-playing",
//     "app-remote-control",

const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private",
    "user-top-read",
    "user-read-recently-played",
    "user-library-read",
    "user-read-email",
    "ugc-image-upload",
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
            if (!user || !account) {
                console.error("SIGNIN_ERROR: NO_USER_PROVIDED");
                return false;
            }
            //create user in database if he doesn't exist
            if (account?.provider !== "spotify") {
                console.error("SIGNIN_ERROR: PROVIDER_NOT_SUPPORTED");
                return false;
            }
            console.log("SIGNIN, account: ", account);
            if (!user.name) {
                console.error("SIGNIN_ERROR: NO_NAME_PROVIDED");
                return false;
            }

            return dbRegisterUser(
                user.id,
                user.name,
                account.access_token!,
                account.refresh_token!,
                account.expires_at!
            );
        },

        async jwt({ token, account }: { token: JWT; account: Account | null; user: User }): Promise<JWT> {
            setDebugMode(false);
            const startTime = new Date().getMilliseconds();
            debugLog(startTime, "JWT CALLBACK START =========================================");

            //on first sign in add the tokens from account to jwt
            if (account) {
                debugLog("JWT: FIRST SIGN IN, getting Account token", account);
                return assignAccountTokensToJwt(token, account);
            }

            const accountfromDb = await dbGetAccountByUserId(token.userId);
            const dbTokenFound = accountfromDb && !accountfromDb.error && accountfromDb.data;

            if (dbTokenFound) {
                const accountDB = accountfromDb.data;
                //check if it's more recent than the one in jwt
                if (accountDB.token_expires > token.accessTokenExpires) {
                    //this will happen when automatic playlist update refreshed the token without user interaction
                    debugLog(
                        startTime,
                        "JWT: db has newer accessToken. Old token:",
                        token.accessToken.slice(0, 10) + "..."
                    );
                    token = assignDbTokenToJWT(token, accountDB);
                } else {
                    debugLog(startTime, "JWT: db has older or same accessToken");
                }

                // now token is always the recent one
                console.log(
                    "JWT: time till expiry: t",
                    (token.accessTokenExpires - Date.now() / 1000 - 60).toFixed(0).toString() + "s"
                );
                //refresh token 1 minute before it expires
                if (token.accessTokenExpires && Date.now() / 1000 >= token.accessTokenExpires - 60) {
                    debugLog(startTime, "JWT: old jwt token EXPIRED", token.accessToken.slice(0, 10) + "...");
                    let refreshToken = (await refreshAccessToken(token)) as JWT;
                    debugLog(startTime, "JWT: new jwt token", refreshToken.accessToken.slice(0, 10) + "...");
                    token = refreshToken;
                } else {
                    debugLog(startTime, "JWT: token is still valid", token.accessToken.slice(0, 10) + "...");
                }

                //update token in db if the current token is more recent
                if (accountDB.token_expires < token.accessTokenExpires) {
                    debugLog(startTime, "JWT: jwt more recent than db, updating db token");
                    if (token) await updateAccountTokenInDb(accountDB, token);
                }

                debugLog(
                    startTime,
                    "JWT END returning token:",
                    token.accessToken.slice(0, 10) + "... ========================="
                );

                return token;
            } else {
                console.error("JWT: no account in db found");
                if (token.accessTokenExpires && Date.now() / 1000 >= token.accessTokenExpires) {
                    //access token has expired, try to update it
                    debugLog("JWT: old token EXPIRED ", token.accessToken.slice(0, 10) + "...");
                    let refreshToken = (await refreshAccessToken(token)) as JWT;
                    debugLog("JWT: new token", refreshToken.accessToken.slice(0, 10) + "...");
                    token = refreshToken;
                }
                const newAccount = await dbRegisterUser(
                    token.userId,
                    token.name,
                    token.accessToken,
                    token.refreshToken,
                    token.accessTokenExpires
                );
                debugLog("JWT: new account created", newAccount);
                debugLog("JWT: returning token without finding DB: ", token.accessToken.slice(0, 10) + "...");

                return token;
            }
        },

        async session({ session, token }) {
            session.user.id = token.userId;
            session.expires = token.accessTokenExpires;

            //TODO: remove accesToken from session, this is for debugging only
            //@ts-ignore
            session.accessToken = token.accessToken;
            return session;
        },
    },
};

function assignDbTokenToJWT(token: JWT, accountDB: MongoAccount) {
    return {
        ...token,
        accessToken: accountDB.access_token,
        refreshToken: accountDB.refresh_token,
        accessTokenExpires: accountDB.token_expires,
    };
}

export async function updateAccountTokenInDb(accountDB: MongoAccount, refreshToken: JWT) {
    debugLog(
        "-> updating account token in db from",
        accountDB.access_token.slice(0, 10) + "...",
        "-> to",
        refreshToken.accessToken.slice(0, 10) + "..."
    );
    accountDB.access_token = refreshToken.accessToken;
    accountDB.refresh_token = refreshToken.refreshToken;
    accountDB.token_expires = refreshToken.accessTokenExpires;
    await accountDB.save();
}

function assignAccountTokensToJwt(token: JWT, account: Account) {
    return {
        ...token,
        accessToken: account.access_token!,
        refreshToken: account.refresh_token!,
        userId: account.providerAccountId,
        accessTokenExpires: account.expires_at!,
    };
}

export async function refreshAccessToken(token: JWT) {
    try {
        debugLog("REFRESHING TOKEN", token.accessToken);
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
        debugLog("REFRESH SUCCESS:", response.ok);
        const refreshedToken = await response.json();
        debugLog("NEW TOKEN= ", refreshedToken.access_token.slice(0, 10) + "...");

        if (!response.ok) throw new Error("NETWORK RESPONSE ERROR");

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Math.floor(Date.now() / 1000 + refreshedToken.expires_in),
            //keep old refresh token if new one is not provided
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        //null if something went wrong -> user will be redirected to sign in page
        console.error("CATCHED REFRESH TOKEN ERROR", error);
        return null;
    }
}

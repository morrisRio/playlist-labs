import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            name?: string | null;
            email?: string | null;
            image?: string | null;
        } & DefaultSession["user"];
        accessToken?: string;
        expires_in?: string;
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT extends DefaultJWT {
        accessToken?: string;
        refreshToken?: string;
        userId?: string;
        accessTokenExpires?: number;
    }
}

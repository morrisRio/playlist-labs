import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "./lib/utils";
import { getAppUrl } from "@/lib/utils";

export async function middleware(req: NextRequest) {
    setDebugMode(true);

    debugLog("MIDDLEWARE ACTIVE =================================================== ");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    debugLog("TOKEN: ", token);
    const { pathname } = req.nextUrl;
    debugLog("PATHNAME: ", pathname);

    if (pathname.includes("/api/auth") || token) {
        debugLog("TOKEN FOUND OR AUTH API, CONTINUE");
        return NextResponse.next();
    }

    debugLog("NO TOKEN, REDIRECTING TO SIGN IN");
    //TODO: PRODUCTION: SET PRODUCTION URL
    setDebugMode(false);
    return NextResponse.redirect(getAppUrl() + "/api/auth/signin");
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

// import { NextMiddleware, NextRequest, NextResponse } from "next/server";
// import { encode, getToken } from "next-auth/jwt";
// import { refreshAccessToken } from "@/lib/auth";

// export const config = {
//     matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
// };

// const sessionCookie = process.env.NEXTAUTH_URL?.startsWith("https://")
//     ? "__Secure-next-auth.session-token"
//     : "next-auth.session-token";

// function signOut(request: NextRequest) {
//     const response = NextResponse.redirect(new URL("/api/auth/signin", request.url));

//     request.cookies.getAll().forEach((cookie) => {
//         if (cookie.name.includes("next-auth")) response.cookies.delete(cookie.name);
//     });

//     return response;
// }

// function shouldUpdateToken(expiresAt: number) {
//     // Check the token expiration date or whatever logic you need
//     return expiresAt && Date.now() / 1000 <= expiresAt;
// }

// export const middleware: NextMiddleware = async (request: NextRequest) => {
//     console.log("Executed middleware");

//     try {
//         const { pathname } = request.nextUrl;
//         if (pathname.includes("/api/auth")) {
//             console.log("Unprotexcted route, continue");
//             return NextResponse.next();
//         }

//         const token = await getToken({ req: request });

//         if (!token) throw new Error("Unauthorized");

//         const response = NextResponse.next();

//         if (shouldUpdateToken(token.accessTokenExpires)) {
//             // Here you retrieve the new access token from your custom backend
//             // const newAccessToken = "Session updated server side!!";
//             const newAccessToken = await refreshAccessToken(token);

//             if (!newAccessToken) throw new Error("Failed to refresh access token");
//             if (!process.env.NEXTAUTH_SECRET) throw new Error("NEXTAUTH_SECRET is not set");

//             const newSessionToken = await encode({
//                 secret: process.env.NEXTAUTH_SECRET,
//                 token: newAccessToken,
//                 maxAge: 30 * 24 * 60 * 60, // 30 days, or get the previous token's exp
//             });

//             // Update session token with new access token
//             response.cookies.set(sessionCookie, newSessionToken);
//         }

//         return response;
//     } catch (error) {
//         console.error("Error in middleware", error);
//         return signOut(request);
//     }
// };

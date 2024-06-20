import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "./lib/logger";
import { sign } from "crypto";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
    setDebugMode(false);
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    if (pathname.includes("/api/auth") || token) {
        debugLog("TOKEN FOUND");
        return NextResponse.next();
    }
    //TODO: BUG this gets called on every page load
    debugLog("NO TOKEN, REDIRECTING TO SIGN IN");

    let signInURL = "";
    if (process.env.NEXTAUTH_URL) {
        signInURL = `${process.env.NEXTAUTH_URL}/api/auth/signin`;
    } else if (process.env.VERCEL_URL) {
        signInURL = `https://${process.env.VERCEL_URL}/api/auth/signin`;
    } else {
        signInURL = "missing-url/api/auth/signin";
        throw new Error("No URL found for sign in");
    }

    return NextResponse.redirect(signInURL);
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

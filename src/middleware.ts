import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { debugLog, setDebugMode } from "./lib/utils";
import { getAppUrl } from "@/lib/utils";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
    setDebugMode(true);

    debugLog("MIDDLEWARE ACTIVE");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    if (pathname.includes("/api/auth") || token) {
        debugLog("TOKEN FOUND");
        return NextResponse.next();
    }
    //TODO: BUG this gets called on every page load even if the user is signed in and no redirect is performed
    debugLog("NO TOKEN, REDIRECTING TO SIGN IN");
    //TODO: PRODUCTION: SET PRODUCTION URL
    return NextResponse.redirect(getAppUrl() + "/api/auth/signin");
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

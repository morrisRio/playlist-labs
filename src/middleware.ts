import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { getAppUrl, debugLog, setDebugMode } from "@/lib/utils";

export async function middleware(req: NextRequest) {
    setDebugMode(false);

    debugLog("MIDDLEWARE ACTIVE");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    debugLog("MIDDLEWARE TOKEN: ", token?.accessToken);
    const { pathname } = req.nextUrl;
    debugLog("PATHNAME: ", pathname);

    if (pathname.includes("/api/auth") || pathname.includes("/pages/about") || token) {
        debugLog("===============================TOKEN FOUND OR AUTH API, CONTINUE");
        return NextResponse.next();
    }

    debugLog("NO TOKEN, REDIRECTING TO SIGN IN");

    setDebugMode(false);
    return NextResponse.redirect(getAppUrl() + "/api/auth/signin");
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

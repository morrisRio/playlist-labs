import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    // console.log("TOKEN IN MIDDLEWARE:", token);
    const { pathname } = req.nextUrl;

    if (pathname.includes("/api/auth") || token) {
        return NextResponse.next();
    }
    //TODO: bug: this gets called on every page load
    console.log("NO TOKEN, REDIRECTING TO SIGN IN");
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/api/auth/signin`);
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};

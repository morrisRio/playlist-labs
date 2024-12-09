//route for demo signin
import { NextRequest, NextResponse } from "next/server";
import { demoSignIn } from "@/lib/auth";

export async function POST(req: NextRequest): Promise<NextResponse> {
    console.log("received POST to /api/auth/signin/demo");
    return demoSignIn(req);
}

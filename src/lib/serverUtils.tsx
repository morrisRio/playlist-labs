"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSession } from "@/types/types";
import { getServerSession } from "next-auth/next";

export const customGet = async (url: string, session: AuthSession) => {
    if (!session) {
        return null;
    }
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
    }).then((res) => res.json());

    return res;
};

export const getAuthSession = async () => {
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session) {
        return null;
    }

    //TODO: check if this is necessary
    // const currentTimestamp = Math.floor(Date.now());
    // if (currentTimestamp >= session.user.expires_at * 1000) {
    //     return null;
    // }

    return session;
};

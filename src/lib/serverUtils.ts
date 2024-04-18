"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSession } from "@/types/spotify";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export const getAuthSession = async () => {
    "use server";
    const session = (await getServerSession(authOptions)) as AuthSession;
    if (!session) {
        return null;
    }
    // console.log("session in serverUtils:", session);
    // session: {
    //   user: {
    //     name: 'karate_morris',
    //     email: 'maurice.rio@gmx.de',
    //     image: 'https://i.scdn.co/image/ab67757000003b821f98e5b65389ae5851e831ca'
    //   },
    //   accessToken: 'BQBxFnEqGPMqQIQ18HKVNZRqV3l9hmz2ykyZNjmT4JVLtIn2siJD8m3Ps_596zm5JuKNiYDCoOs8nmAasjaVNE_k9bXExXh7IsKhSfO4VRa9Iz5sBUCJt5p8jhsJzjxm-ClacU8ehpVDhebhhepAyRsBgv9hOeh3Y2AglO02NaM9OjiH2P-FaggkjPWuKVs8n7Jkg6wkTv7_L9ozznq8cmN7fznQDNhPFMUYnLpOXq7uh3kud2r_IooGX2Bc6W-jvaTss0M-uZcqlD8',
    //   expires_in: '9.3min'
    // }
    return session;
};

export const customGet = async (
    url: string,
    token: string
): Promise<NextResponse> => {
    "use server";
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => res.json());
    console.log("res:", res);

    return res;
};

/* this is a function */
export const customPost = async (
    url: string,
    body: object,
    token: string
): Promise<NextResponse> => {
    "use server";

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error(
                    "Network response was not ok " +
                        res.status +
                        " " +
                        res.statusText
                );
            }
            return res.json();
        })
        .catch((error) => {
            console.error("Error creating Playlist:", error);
            return null;
        });

    return res;
};

export async function helloWorld() {
    "use server";
    console.log("helloWorld");
}

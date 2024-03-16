"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AuthSession } from "@/types/types";
import { getServerSession } from "next-auth/next";

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

export const customGet = async (url: string, session: AuthSession) => {
    "use server";
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

export const customPost = async (url: string, body: object) => {
    "use server";
    const session = await getAuthSession();

    if (!session) {
        console.error("No session found");
        return null;
    }

    const res = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok");
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

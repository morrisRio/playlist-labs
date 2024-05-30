"use server";

import { authOptions } from "@/lib/auth";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { debugLog, setDebugMode } from "@/lib/logger";

/* helper function for getServerSession() to avoid passing authOptions around */
export async function auth(
    calledBy: string = "",
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
    setDebugMode(false);
    debugLog(" - auth() from: ", calledBy);
    return getServerSession(...args, authOptions);
}

/* takes the url and a token to make an authorized get request*/
export const spotifyGet = async (url: string, token: string): Promise<any> => {
    setDebugMode(false);
    debugLog(" - spotifyGet()");
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok " + res.status + " " + res.statusText);
            }
            return res.json();
        })
        .catch((error) => {
            console.error("Error on custom GET:" + url, error);
            return NextResponse.json({
                message: error.statusText,
                status: 500,
            });
        });

    return response;
};

/* takes the url a body object and a token to make an authorized post request*/
export const spotifyPost = async (url: string, body: object, token: string): Promise<any> => {
    setDebugMode(false);
    debugLog(" - spotifyPost()");
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok " + res.status + " " + res.statusText);
            }
            return res.json();
        })
        .catch((error) => {
            console.error("Error on custom POST:" + url, error);
            return NextResponse.json({
                message: error.statusText,
                status: 500,
            });
        });

    return response;
};

/* takes the url a body object and a token to make an authorized post request*/
export const spotifyPut = async (url: string, body: object, token: string): Promise<any> => {
    setDebugMode(false);
    debugLog(" - spotifyPut()");
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Network response was not ok " + res.status + " " + res.statusText);
            }
            return res;
        })
        .catch((error) => {
            console.error("Error on custom PUT:" + url, error);
            return NextResponse.json({
                message: error.statusText,
                status: 500,
            });
        });

    return response;
};

"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

/* helper function for getServerSession() to avoid passing authOptions around */
export async function auth(
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
    return getServerSession(...args, authOptions);
}

//TODO: check all types again
/* takes the url and a token to make an authorized get request*/
export const spotifyGet = async (url: string, token: string): Promise<any> => {
    "use server";
    console.log(" - spotifyGet()");
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
    "use server";
    console.log(" - spotifyPost()");
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
    "use server";
    console.log(" - spotifyPut()");
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })
        .then((res) => {
            // console.log(" - spotifyPut() response", res);
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

"use server";

import { authOptions } from "@/lib/auth";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { debugLog, setDebugMode } from "@/lib/utils";
import { fetchFromSpotify, ValidationFunction } from "@/lib/spotifyApiUtils";

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

/**
 * Makes a GET request to the Spotify API with the provided URL and token.
 * @param url - The URL to make the GET request to.
 * @param token - The access token for authentication.
 * @param validationFunction - Optional. The function used to validate the fetched data.
 * @param debug - Optional parameter to enable debug mode. Defaults to false.
 * @returns A Promise that resolves to the response from the Spotify API.
 */
export const spotifyGet = async (
    url: string,
    token: string,
    validationFunction?: ValidationFunction,
    debug: boolean = false
): Promise<any> => {
    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return fetchFromSpotify(url, options, validationFunction, debug);
};

/**
 * Makes a POST request to the Spotify API with the provided URL, token, body, and validation function.
 * @param url - The URL to make the POST request to.
 * @param token - The access token for authorization.
 * @param body - The request body to send.
 * @param validationFunction - Optional. The function used to validate the fetched data.
 * @param debug - Optional. Set to true to enable debug mode.
 * @returns A Promise that resolves to the response from the Spotify API.
 */
export const spotifyPost = async (
    url: string,
    token: string,
    body: any,
    validationFunction?: ValidationFunction,
    debug: boolean = false
): Promise<any> => {
    const options = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    return fetchFromSpotify(url, options, validationFunction, debug);
};

/**
 * Makes a PUT request to the Spotify API.
 *
 * @param url - The URL to send the request to.
 * @param token - The access token for authentication.
 * @param body - The request body.
 * @param validationFunction - Optional. The function used to validate the fetched data.
 * @param debug - Optional. Set to true to enable debug mode.
 * @returns A Promise that resolves to the response data.
 */
export const spotifyPut = async (
    url: string,
    token: string,
    body: any,
    validationFunction?: ValidationFunction,
    debug: boolean = false
): Promise<any> => {
    const options = {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };

    return fetchFromSpotify(url, options, validationFunction, debug);
};

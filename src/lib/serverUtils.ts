"use server";

import { authOptions } from "@/lib/auth";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { debugLog, getAppUrl, setDebugMode } from "@/lib/utils";

/* helper function for getServerSession() to avoid passing authOptions around */
export async function auth(
    calledBy: string = "",
    ...args:
        | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
        | [NextApiRequest, NextApiResponse]
        | []
) {
    setDebugMode(false);
    debugLog("auth() function called", calledBy);
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
 * @param url - The URL to send the request to.
 * @param token - The access token for authentication.
 * @param body - The request body.
 * @param header - Additional headers to include in the request.
 * @param validationFunction - A function to validate the response.
 * @param debug - Whether to enable debug mode.
 * @returns A Promise that resolves to the response data.
 */
export const spotifyPut = async (
    url: string,
    token: string,
    body: any,
    header?: HeadersInit,
    validationFunction?: ValidationFunction,
    debug: boolean = false
): Promise<any> => {
    const requestHeader = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...header,
    };

    if (debug) console.log("spotifyPut requestHeader", requestHeader);

    const options = {
        method: "PUT",
        headers: requestHeader,
        body: typeof body === "string" ? body : JSON.stringify(body),
    };

    return fetchFromSpotify(url, options, validationFunction, debug);
};

import { ErrorRes } from "@/types/spotify";

/**
 * Represents a validation function that takes in data and returns an object
 * indicating whether the data is valid or not.
 */
export type ValidationFunction = (data: any) => { valid: boolean; message?: string; status?: number };

/**
 * Standard validation function.
 *
 * @param data - The data to be validated.
 * @returns An object indicating whether the data is valid or not.
 */
const defaultValidationFunction: ValidationFunction = (data) => {
    if (data === null || data === undefined) {
        return { valid: false, message: "No data found", status: 404 };
    }
    return { valid: true };
};

/**
 * Handles the response from a fetch request.
 *
 * @param {Response} res - The fetch response.
 * @param {boolean} debug - Indicates if debug mode is enabled.
 * @returns {Promise<any>} The parsed response data or an error object.
 */
export const handleResponse = async (res: Response, debug: boolean): Promise<any | ErrorRes> => {
    if (debug) console.log(" - handleResponse() status:", res.status, res.statusText);

    if (!res.ok) {
        if (debug) console.log(" - handleResponse() error:", res.statusText);
        return handleSpotifyError(res);
    }

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : await res.text();
    if (debug) console.log(" - handleResponse() data:", data);
    return data;
};

/**
 * Takes a failed Spotify API response and returns an object with a message and status.
 *
 * @param error - The failed response object from the Spotify API.
 * @param defaultMessage - The default error message to use if the error object does not contain a message.
 * @param defaultStatus - The default error status to use if the error object does not contain a status.
 * @returns An object with a message and status representing the error.
 */
export const handleSpotifyError = (
    failedRes: any,
    defaultMessage: string = "Internal Server Error",
    defaultStatus: number = 500
) => {
    return {
        error: { message: failedRes.statusText || defaultMessage, status: failedRes.status || defaultStatus },
    };
};

/**
 * Fetches data from the Spotify API using the provided URL and options.
 *
 * @param url - The URL to fetch data from.
 * @param options - The options to be passed to the fetch function.
 * @param validationFunction - Optional. The function used to validate the fetched data.
 * @param debug - Optional. Set to true to enable debug logging. Defaults to false.
 * @returns A Promise that resolves to the fetched data, or an error object if there was an error.
 */
export const fetchFromSpotify = async (
    url: string,
    options: RequestInit,
    validationFunction?: ValidationFunction,
    debug: boolean = false
): Promise<any> => {
    if (debug) console.log(" - fetchFromSpotify() URL:", url, "Options:", options);

    const data = await fetch(url, options)
        .then((res) => handleResponse(res, debug))
        .then((data) => {
            //if there was problem with the response, forward the error object
            if (data.error) {
                return data;
            }

            if (debug) console.log(" - fetchFromSpotify() data after fetch:", data);

            // Default validation
            const defaultValidationResult = defaultValidationFunction(data);
            if (!defaultValidationResult.valid) {
                return {
                    error: {
                        message: defaultValidationResult.message || "Invalid data",
                        status: defaultValidationResult.status || 400,
                    },
                };
            }

            // Custom validation if provided
            if (validationFunction) {
                const validationResult = validationFunction(data);
                if (!validationResult.valid) {
                    if (debug) console.log(" - fetchFromSpotify() validation failed:", validationResult);
                    return {
                        error: {
                            message: validationResult.message || "Invalid data",
                            status: validationResult.status || 404,
                        },
                    };
                }
            }

            if (debug) console.log(" - fetchFromSpotify() validation succeeded");
            return data;
        })
        .catch((error) => {
            console.error("Unexpected Error", error);
            return { error: { message: error.message || "Unexpected Error", status: 500 } };
        });

    return data;
};

export const testFunction = async () => {
    "use server";
    console.log("Test started");
    const res = await fetch(`${getAppUrl()}/api/cron`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
    })
        .then(async (res) => {
            const response = await res.json();
            return response;
        })
        .catch((err) => {
            console.error(err);
            return { data: null, message: "smthn went wrong" };
        });

    if ("data" in res) console.log("Test ended", res.data);
};

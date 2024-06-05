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

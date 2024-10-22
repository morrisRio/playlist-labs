import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { sleep } from "@/lib/utils";

export function useSwrTokenRefresh<T>(url: string | null): SWRResponse<T, Error> {
    const { update: updateSession } = useSession();

    //TODO: production remove accesToken from session

    const fetcher: Fetcher<T> = useCallback(async (fetchUrl: string) => {
        const res = await fetch(fetchUrl);
        if (!res.ok) {
            const errorRes = await res.json();
            const error: any = new Error("Error on fetch");
            error.info = errorRes;
            error.status = res.status;
            console.error("Error fetching data:", errorRes);
            throw error;
        }
        return res.json();
    }, []);

    const options: SWRConfiguration = useMemo(
        () => ({
            revalidateOnMount: true,
            // Only revalidate on specific conditions
            revalidateOnFocus: false,
            revalidateIfStale: false,
            keepPreviousData: true,
            onErrorRetry: async (error, key, config, revalidate, { retryCount }) => {
                console.log("retrying", error, retryCount);

                if (error.status === 404) {
                    console.log("Resource not found: ", error.message);
                    return;
                }

                if (error.status === 401) {
                    console.log("Unauthorized, trying to refresh");
                    await updateSession();
                    // Add a small delay to ensure session update is processed
                    await sleep(500);
                }

                if (retryCount >= 4) {
                    return;
                }

                revalidate({ retryCount });
            },
        }),
        [updateSession]
    );

    return useSWR<T>(url, fetcher, options);
}

export default useSwrTokenRefresh;

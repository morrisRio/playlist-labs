import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";

import { sleep } from "@/lib/utils";

export function useSwrTokenRefresh<T>(url: string | null): SWRResponse<T, Error> {
    const { update: updateSession } = useSession();

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
            revalidateOnFocus: false,
            revalidateIfStale: false,
            keepPreviousData: true,
            onErrorRetry: async (error, key, config, revalidate, { retryCount }) => {
                if (error.status === 404) {
                    console.error("Resource not found: ", error.message);
                    return;
                }

                if (error.status === 401) {
                    console.error("Unauthorized, trying to refresh");
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

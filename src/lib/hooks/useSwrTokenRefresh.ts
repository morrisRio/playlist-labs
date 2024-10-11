import useSWR, { Fetcher, SWRConfiguration, SWRResponse } from "swr";
import { useSession } from "next-auth/react";

export function useSwrTokenRefresh<T>(url: string | null): SWRResponse<T, Error> {
    const { data: session, update: updateSession } = useSession();

    //TODO: remove accesToken from session, this is for debugging only
    //@ts-ignore
    if (session && session.accessToken) {
        //@ts-ignore
        console.log("Token in client component: ", session.accessToken.slice(0, 10) + "...");
    }

    //TODO: performance avoid unnecessary session requests on state changes of parent component

    const fetcher: Fetcher<T> = async (fetchUrl: string) => {
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
    };

    const options: SWRConfiguration = {
        revalidateOnMount: true,
        onErrorRetry: async (error, key, config, revalidate, { retryCount }) => {
            console.log("retrying", error, retryCount);
            if (error.status === 404) {
                console.log("Resource not found: ", error.message);
                return;
            }
            if (error.status === 401) {
                console.log("Unauthorized, trying to refresh");
                await updateSession();
            }

            if (retryCount >= 4) {
                // Consider implementing a sign-out mechanism here
                return;
            }
            revalidate({ retryCount });
        },
    };

    return useSWR<T>(url, fetcher, options);
}

export default useSwrTokenRefresh;

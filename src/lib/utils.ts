let debugMode = false;

export const setDebugMode = (mode: boolean) => {
    debugMode = mode;
};

export const debugLog = (...args: any) => {
    if (debugMode) {
        console.log(...args);
    }
};

export const getAppUrl = () => {
    try {
        if (process.env.NEXTAUTH_URL) {
            return process.env.NEXTAUTH_URL;
        } else if (process.env.VERCEL_ENV === "preview") {
            return `https://playlist-labs-git-dev-maurices-projects-1e3466ea.vercel.app`;
        } else if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        } else {
            throw new Error(
                "Failed to find a a valid URL for the app. Add NEXTAUTH_URL to your environment variables."
            );
        }
    } catch (error) {
        console.error(error);
        return "missing-url";
    }
};

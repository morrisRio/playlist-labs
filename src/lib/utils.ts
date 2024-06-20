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
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL;
    } else if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    } else {
        return "missing-url";
    }
};

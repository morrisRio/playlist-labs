let debugMode = false;

export const setDebugMode = (mode: boolean) => {
    debugMode = mode;
};

export const debugLog = (...args: any) => {
    if (debugMode) {
        console.log(...args);
    }
};

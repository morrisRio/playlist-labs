import { Canvas } from "@napi-rs/canvas";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

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

export const getCssHueGradient = (hue: number) => {
    return `radial-gradient(circle at 30% 30%, hsl(${
        (hue - 100) % 360
    } 95% 47% / 30%), hsl(${hue} 94% 47% / 10%)), linear-gradient(-20deg, hsl(${hue} 89% 47%), hsl(${
        (hue - 100) % 360
    } 89% 47%)) `;
};

export const createCanvasGradient = (canvas: Canvas, hue: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw linear gradient
    const linearGradient = ctx.createLinearGradient(0.364 * width, 0, width, height);
    linearGradient.addColorStop(0, `hsl(${(hue - 100) % 360}, 89%, 47%)`);
    linearGradient.addColorStop(1, `hsl(${hue}, 89%, 47%)`);

    ctx.fillStyle = linearGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw radial gradient
    const radialGradient = ctx.createRadialGradient(0.3 * width, 0.3 * height, 0, 0.3 * width, 0.3 * height, width);
    radialGradient.addColorStop(0, `hsl(${(hue - 100) % 360}, 95%, 47%, 0.3)`);
    radialGradient.addColorStop(1, `hsl(${hue}, 95%, 47%, 0.1)`);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);
};

const fullConfig = resolveConfig(tailwindConfig);
//@ts-expect-error
export const twUi900 = fullConfig.theme.colors.ui[900] || "transparent";
//@ts-expect-error
export const twUi700 = fullConfig.theme.colors.ui[700] || "grey";
//@ts-expect-error
export const twUi500 = fullConfig.theme.colors.ui[500] || "lightgrey";

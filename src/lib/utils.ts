import { Canvas, Image } from "@napi-rs/canvas";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config";

export function sleep(ms: number): Promise<unknown> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

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
            return process.env.VERCEL_URL;
        } else if (process.env.VERCEL_ENV === "production") {
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
    return `radial-gradient(circle at 30% 30%, hsl(${hue} 95% 47% / 30%), hsl(${(hue - 100) % 360} 95% 47% / 10%)), 
    linear-gradient(-20deg, hsl(${(hue - 100) % 360} 89% 47%), hsl(${hue} 89% 47%)) `;
};

export const createCanvasGradient = async (canvas: Canvas, hue: number, image: unknown) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw linear gradient
    const linearGradient = ctx.createLinearGradient(0.364 * width, 0, width, height);
    linearGradient.addColorStop(0, `hsl(${hue}, 89%, 47%)`);
    linearGradient.addColorStop(1, `hsl(${(hue - 100) % 360}, 89%, 47%)`);

    ctx.fillStyle = linearGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw radial gradient
    const radialGradient = ctx.createRadialGradient(0.3 * width, 0.3 * height, 0, 0.3 * width, 0.3 * height, width);
    radialGradient.addColorStop(0, `hsl(${hue}, 95%, 47%, 0.3)`);
    radialGradient.addColorStop(1, `hsl(${(hue - 10) % 360}, 95%, 47%, 0.1)`);
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw logo
    const logoSize = 0.15 * height;

    const posX = width - logoSize - width * 0.04;
    const posY = height - logoSize - height * 0.04;
    ctx.drawImage(image as Image, posX, posY, logoSize, logoSize);
};

interface ExtractedColor {
    hex: string;
    red: number;
    green: number;
    blue: number;
    area: number;
    hue: number;
    saturation: number;
    lightness: number;
    intensity: number;
}

//helper for finding the most distinct colors from the ones returned by extract-colors
export const getDistinctColors = (colors: ExtractedColor[]): [string, string] => {
    // Sort all colors by vibrancy (saturation * lightness)
    const sortedColors = [...colors].sort((a, b) => {
        const vibrancyA = a.saturation * a.lightness;
        const vibrancyB = b.saturation * b.lightness;
        return vibrancyB - vibrancyA;
    });

    // Filter out near-black colors and keep only saturated colors
    const viableColors = sortedColors.filter(
        (color) =>
            color.lightness > 0.1 && // Skip very dark colors
            color.saturation > 0.2 // Skip desaturated colors
    );

    // If we have 0 or 1 viable colors, return the most vibrant color twice
    if (viableColors.length <= 1) {
        const mostVibrantColor = viableColors[0]?.hex || sortedColors[0].hex;
        return [mostVibrantColor, mostVibrantColor];
    }

    // If we have exactly 2 colors, return them
    if (viableColors.length === 2) {
        return [viableColors[0].hex, viableColors[1].hex];
    }

    // For 3+ colors, find the pair with maximum hue difference and saturation
    let maxScore = 0;
    let colorPair: [string, string] = [viableColors[0].hex, viableColors[1].hex];

    // Compare each pair of colors
    for (let i = 0; i < viableColors.length - 1; i++) {
        for (let j = i + 1; j < viableColors.length; j++) {
            const color1 = viableColors[i];
            const color2 = viableColors[j];

            // Calculate hue difference (values are already normalized to 0-1)
            let hueDiff = Math.abs(color1.hue - color2.hue);
            if (hueDiff > 0.5) hueDiff = 1 - hueDiff; // Handle circular nature of hue

            // Calculate score based on hue difference and average saturation
            const avgSaturation = (color1.saturation + color2.saturation) / 2;
            const avgVibrancy = (color1.saturation * color1.lightness + color2.saturation * color2.lightness) / 2;
            const score = hueDiff * avgSaturation * avgVibrancy;

            if (score > maxScore) {
                maxScore = score;
                colorPair = [color1.hex, color2.hex];
            }
        }
    }

    return colorPair;
};

const fullConfig = resolveConfig(tailwindConfig);
//@ts-expect-error
export const twUi900 = fullConfig.theme.colors.ui[900] || "transparent";
//@ts-expect-error
export const twUi700 = fullConfig.theme.colors.ui[700] || "grey";
//@ts-expect-error
export const twUi500 = fullConfig.theme.colors.ui[500] || "lightgrey";

import { Preferences, Rule, Seed, SubmitPlaylistData, SubmitRefreshData } from "@/types/spotify";
import { debugLog } from "./utils";

// Utility functions for sanitization

export function sanitizeBoolean(value: unknown): boolean {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        value = value.toLowerCase().trim();
        if (value === "true" || value === "1") return true;
        if (value === "false" || value === "0") return false;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    return false; // default fallback
}

// Utility type to specify sanitization context
type SanitizeContext = "url" | "text" | "id" | "displayText";

export function sanitizeString(input: string, context: SanitizeContext = "text"): string {
    // Base sanitization for all contexts
    let sanitized = input
        // Remove null bytes
        .replace(/\0/g, "")
        // Remove control characters
        .replace(/[\x00-\x1F\x7F]/g, "")
        // Limit reasonable string length (adjust as needed)
        .slice(0, 2000);

    switch (context) {
        case "displayText": {
            // For display text (like Spotify titles), only remove potentially dangerous HTML/script content
            // while preserving special characters and Unicode
            return (
                sanitized
                    // Remove any HTML tags
                    .replace(/<[^>]*>/g, "")
                    // Remove potential script content
                    .replace(/javascript:/gi, "")
                    .replace(/data:/gi, "")
                    .replace(/vbscript:/gi, "")
                    // Remove any other potentially dangerous patterns
                    .replace(/expression\s*\(/gi, "")
                    .replace(/eval\s*\(/gi, "")
                    // But preserve special characters and Unicode
                    .trim()
            );
        }

        case "url": {
            try {
                // Try to parse and validate URL
                const url = new URL(sanitized);
                // Only allow specific protocols
                if (!["http:", "https:", "spotify:"].includes(url.protocol)) {
                    return "";
                }
                // Return the validated URL
                return url.toString();
            } catch {
                // If URL is invalid, return empty string
                return "";
            }
        }

        case "id": {
            // For IDs, only allow alphanumeric characters, dashes, and underscores
            return sanitized.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 100); // IDs should be reasonably short
        }

        case "text":
        default: {
            // For regular text, encode special characters to prevent XSS
            return (
                sanitized
                    .replace(
                        /[&<>"']/g,
                        (char) =>
                            ({
                                "&": "&amp;",
                                "<": "&lt;",
                                ">": "&gt;",
                                '"': "&quot;",
                                "'": "&#x27;",
                            }[char] || char)
                    )
                    // Remove potential script tags and other dangerous HTML
                    .replace(/<(|\/|[^/>][^>]+|\/[^>][^>]+)>/g, "")
            );
        }
    }
}

export function sanitizeNumber(input: number): number {
    // Ensure it's a finite number within reasonable bounds
    if (!Number.isFinite(input)) return 0;
    return Math.min(Math.max(input, -1000000), 1000000);
}

function sanitizeArray<T>(arr: T[], itemSanitizer: (item: T) => T, maxLength: number): T[] {
    return arr.slice(0, maxLength).map(itemSanitizer);
}

// Enhanced type guards with sanitization
export function sanitizeAndValidatePreferences(obj: unknown): {
    valid: boolean;
    data?: Preferences;
    error?: string;
} {
    debugLog("sanizing preferences");
    if (typeof obj !== "object" || obj === null) {
        return { valid: false, error: "Invalid preferences object" };
    }

    const pref = obj as Preferences;
    const validFrequencies = ["daily", "weekly", "monthly", "never"];

    if (typeof pref.name !== "string") {
        return { valid: false, error: "Invalid name type" };
    }
    if (typeof pref.frequency !== "string" || !validFrequencies.includes(pref.frequency)) {
        return { valid: false, error: "Invalid frequency" };
    }
    if (typeof pref.amount !== "number") {
        return { valid: false, error: "Invalid amount type" };
    }

    // Sanitize and construct valid preferences object
    const sanitizedPreferences: Preferences = {
        name: sanitizeString(pref.name),
        frequency: pref.frequency as "daily" | "weekly" | "monthly" | "never",
        amount: sanitizeNumber(pref.amount),
        hue: pref.hue !== undefined ? sanitizeNumber(pref.hue) : undefined,
        on: pref.on !== undefined ? sanitizeNumber(pref.on) : undefined,
    };

    return { valid: true, data: sanitizedPreferences };
}

function sanitizeAndValidateSeed(obj: unknown): {
    valid: boolean;
    data?: Seed;
    error?: string;
} {
    debugLog("sanizing seed:", obj);
    if (typeof obj !== "object" || obj === null) {
        return { valid: false, error: "Invalid seed object" };
    }

    const seed = obj as Seed;

    if (!seed.type || !seed.id || !seed.title) {
        return { valid: false, error: "Missing required seed properties" };
    }

    // Sanitize and construct valid seed object
    const sanitizedSeed: Seed = {
        ...(seed.spotify && { spotify: sanitizeString(seed.spotify, "url") }),
        type: sanitizeString(seed.type, "text"),
        id: sanitizeString(seed.id, "id"),
        title: sanitizeString(seed.title, "displayText"),
        description: sanitizeString(seed.description, "displayText"),
        thumbnail:
            typeof seed.thumbnail === "string"
                ? sanitizeString(seed.thumbnail)
                : sanitizeNumber(seed.thumbnail as number),
    };

    return { valid: true, data: sanitizedSeed };
}

function sanitizeAndValidateRule(obj: unknown): {
    valid: boolean;
    data?: Rule;
    error?: string;
} {
    debugLog("sanizing rule:", obj);
    if (typeof obj !== "object" || obj === null) {
        return { valid: false, error: "Invalid rule object" };
    }

    const rule = obj as Rule;

    switch (rule.type) {
        case "boolean": {
            if (typeof rule.value !== "boolean") {
                return { valid: false, error: "Invalid boolean rule value" };
            }

            return {
                valid: true,
                data: {
                    name: sanitizeString(rule.name),
                    type: "boolean",
                    value: rule.value,
                    range: sanitizeArray(rule.range, sanitizeString, 100),
                    description: sanitizeString(rule.description),
                },
            };
        }

        case "axis": {
            if (
                !Array.isArray(rule.value) ||
                rule.value.length !== 2 ||
                !rule.value.every((v) => typeof v === "number")
            ) {
                return { valid: false, error: "Invalid axis rule value" };
            }

            return {
                valid: true,
                data: {
                    name: sanitizeString(rule.name),
                    type: "axis",
                    value: [sanitizeNumber(rule.value[0]), sanitizeNumber(rule.value[1])],
                    range: [
                        sanitizeArray(rule.range[0], sanitizeString, 100),
                        sanitizeArray(rule.range[1], sanitizeString, 100),
                    ],
                    description: sanitizeString(rule.description),
                },
            };
        }

        case "range": {
            if (typeof rule.value !== "number") {
                return { valid: false, error: "Invalid range rule value" };
            }

            return {
                valid: true,
                data: {
                    name: sanitizeString(rule.name),
                    type: "range",
                    value: sanitizeNumber(rule.value),
                    range: rule.range?.map((v) => (typeof v === "string" ? sanitizeString(v) : sanitizeNumber(v))),
                    description: sanitizeString(rule.description),
                },
            };
        }

        default:
            return { valid: false, error: "Invalid rule type" };
    }
}

type validPlaylistData<DataType> = {
    valid: true;
    errors: [];
    sanitizedData: DataType;
};

type invalidPlaylistData = {
    valid: false;
    errors: string[];
};

type validationResponse<DataType> = validPlaylistData<DataType> | invalidPlaylistData;

// Main validation and sanitization function
export function vsPlaylistData(data: unknown): validationResponse<SubmitPlaylistData> {
    const errors: string[] = [];

    if (typeof data !== "object" || data === null) {
        return { valid: false, errors: ["Invalid data structure"] };
    }

    const playlistData = data as SubmitPlaylistData;

    // Validate and sanitize preferences
    const preferencesResult = sanitizeAndValidatePreferences(playlistData.preferences);
    if (!preferencesResult.valid) {
        errors.push(`Invalid preferences: ${preferencesResult.error}`);
    }

    const seedResults = (playlistData.seeds || []).map((seed) => sanitizeAndValidateSeed(seed));

    const invalidSeeds = seedResults.filter((result) => !result.valid);
    if (invalidSeeds.length > 0) {
        errors.push(...invalidSeeds.map((result) => `Invalid seed: ${result.error}`));
    }

    // Validate and sanitize rules if present
    const ruleResults = (playlistData.rules || []).map((rule) => {
        return sanitizeAndValidateRule(rule);
    });

    const invalidRules = ruleResults.filter((result) => !result.valid);
    if (invalidRules.length > 0) {
        errors.push(...invalidRules.map((result) => `Invalid rule: ${result.error}`));
    }

    // Business logic validation
    if (preferencesResult.data!.name.length < 1) {
        errors.push("Your Playlist should have a name.");
    }

    if (preferencesResult.data!.amount < 5 || preferencesResult.data!.amount > 50) {
        errors.push("The amount of tracks should be between 5 and 50.");
    }

    const validSeeds = seedResults.map((result) => result.data!);
    if (validSeeds.length < 1) {
        errors.push("We'll need at least one Seed for creating the Playlist.");
    }

    if (validSeeds.length > 5) {
        errors.push("We can only handle 5 seeds at a time.");
    }

    if (errors.length > 0) {
        console.error("Validation errors:", errors);
        return { valid: false, errors };
    }

    // Construct sanitized playlist data
    const sanitizedData: SubmitPlaylistData = {
        playlist_id: playlistData.playlist_id ? sanitizeString(playlistData.playlist_id) : undefined,
        preferences: preferencesResult.data!,
        seeds: validSeeds,
        rules: playlistData.rules ? ruleResults.map((result) => result.data!) : undefined,
        newSongsSettings: true,
    };

    return {
        valid: true,
        errors: [],
        sanitizedData,
    };
}

export function vsPlaylistRefreshData(data: unknown): validationResponse<SubmitRefreshData> {
    const refreshData = data as SubmitRefreshData;
    const errors: string[] = [];

    const sanitizedPlaylistId = refreshData.playlist_id ? sanitizeString(refreshData.playlist_id) : undefined;

    if (!sanitizedPlaylistId) {
        errors.push("No Playlist ID provided");
        return { valid: false, errors };
    }

    const sanitizedData: SubmitRefreshData = {
        playlist_id: sanitizedPlaylistId,
        newSongsSettings: false,
    };

    return {
        valid: true,
        errors: [],
        sanitizedData,
    };
}

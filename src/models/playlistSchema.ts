import mongoose, { Schema, Document } from "mongoose";

interface Rule {
    rule_name: string;
    rule_value: number | boolean | [number, number];
}

interface Playlist extends Document {
    playlist_id: string;
    lastUpdated: Date;
    preferences: {
        name: string;
        amount: string;
        frequency: string;
        on?: number;
    };
    seeds: {
        seed_id: string;
        seed_type: string;
        seed_name: string;
        seed_description: string;
        seed_image: string;
    }[];
    rules?: Rule[];
    trackHistory: string[];
}

export const playlistSchema = new Schema<Playlist>({
    playlist_id: {
        type: String,
        required: true,
        unique: true,
    },
    lastUpdated: {
        type: Date,
        default: Date.now(),
    },
    preferences: {
        name: {
            type: String,
            required: true,
        },
        frequency: {
            type: String,
            required: true,
        },
        on: {
            type: Number,
            required: [
                function (this: Playlist) {
                    if (this.preferences.frequency === "weekly" || this.preferences.frequency === "monthly") {
                        return true;
                    }
                    return false;
                },
                "On field is required for weekly or monthly playlists",
            ],
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    seeds: [
        {
            id: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            thumbnail: {
                type: mongoose.Schema.Types.Mixed,
                validate: {
                    validator: function (v: any) {
                        // Custom validation function to check the type of value
                        if (typeof v === "string" || typeof v === "number") {
                            return true;
                        } else {
                            // Invalid value
                            return false;
                        }
                    },
                    message: "Thumbnail value must be a string or a number",
                },
            },
            _id: false,
        },
    ],
    rules: [
        {
            name: {
                type: String,
                required: function () {
                    return this.rules && this.rules.length > 0;
                },
                _id: false,
            },
            value: {
                type: mongoose.Schema.Types.Mixed,
                validate: {
                    validator: function (v: any) {
                        // Custom validation function to check the type of value
                        if (Array.isArray(v) && v.length === 2 && v.every((num) => typeof num === "number")) {
                            // Array of two numbers
                            return true;
                        } else if (typeof v === "number" || typeof v === "boolean") {
                            // Single number or boolean
                            return true;
                        } else {
                            // Invalid value
                            return false;
                        }
                    },
                    message: "Rule value must be a string, a number, or an Array of two numbers",
                },
                required: function () {
                    return this.rules && this.rules.length > 0;
                },
            },
            _id: false,
        },
    ],
    trackHistory: [
        {
            type: mongoose.Schema.Types.Mixed,
            validate: {
                validator: function (h: any) {
                    // Custom validation function to check the type of value
                    if (
                        Array.isArray(h) &&
                        h.every((version) => version.tracks?.every((track: unknown) => typeof track === "string")) &&
                        h.every((version) => version.added_at.getDate)
                    ) {
                        // check if the array is an array of PlaylistVersion objects
                        return true;
                    } else if (typeof h === "string") {
                        return true;
                    } else {
                        // Invalid value
                        return false;
                    }
                },
                message: "Rule value must be a string, a number, or an Array of two numbers",
            },
            required: true,
        },
    ],
});

import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
    {
        date: {
            type: Date,
            default: Date.now, // Automatically sets the current date if not provided
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        success: {
            type: Boolean,
            required: true,
        },
        info: {
            type: Schema.Types.Mixed, // Allows storing any data type
            default: null,
        },
    },
    {
        timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
    }
);

const LogModel = mongoose.models.Log || mongoose.model("log", logSchema);

export default LogModel;

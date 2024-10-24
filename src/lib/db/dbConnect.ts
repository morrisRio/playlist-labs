import { ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import { debugLog, setDebugMode } from "@/lib/utils";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

declare global {
    var mongoose: any;
}

global.mongoose = {
    conn: null,
    promise: null,
};

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
    const options = {
        autoIndex: true,
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    };

    if (process.env.VERCEL_ENV === "production") {
        return await mongoose.connect(MONGODB_URI, options);
    } else {
        if (cached.conn) {
            return cached.conn;
        }

        if (!cached.promise) {
            cached.promise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
                return mongoose;
            });
        }
        try {
            cached.conn = await cached.promise;
        } catch (e) {
            debugLog("DB: Error connecting to MongoDB: ", e);
            cached.promise = null;
            throw e;
        }
        return cached.conn;
    }
};

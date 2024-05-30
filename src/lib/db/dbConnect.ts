import { ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
import { debugLog, setDebugMode } from "@/lib/logger";

declare global {
    var mongoose: any;
}

global.mongoose = {
    conn: null,
    promise: null,
};

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export const connectMongoDB = async () => {
    setDebugMode(false);
    if (cached.conn) {
        debugLog("DB: Using cached connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const options = {
            autoIndex: true,
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        };
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
    debugLog("DB: Using new connection");
    return cached.conn;
};

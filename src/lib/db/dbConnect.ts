import { ServerApiVersion } from "mongodb";
import mongoose from "mongoose";

import { debugLog } from "@/lib/utils";

const MONGODB_URI = process.env.DEMO ? process.env.DEMO_MONGO_URI! : process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    if (process.env.DEMO) {
        throw new Error("Please define the DEMO_MONGO_URI environment variable inside .env.local");
    } else {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }
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
    console.log("DB: Connecting to MongoDB");
    console.log("DB: MONGODB_URI: ", MONGODB_URI);

    if (process.env.VERCEL_ENV === "production") {
        const connectionPromise = mongoose.connect(MONGODB_URI, options).then((mongoose) => {
            return mongoose;
        });
        let connection;
        try {
            connection = await connectionPromise;
        } catch (e) {
            debugLog("DB: Error connecting to MongoDB: ", e);
            throw e;
        }
        return connection;
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

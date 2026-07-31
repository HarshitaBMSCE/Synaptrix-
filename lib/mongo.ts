import mongoose from "mongoose";

type CachedConnection = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & { mongooseCache?: CachedConnection };

const cache = globalForMongoose.mongooseCache ?? { conn: null, promise: null };
globalForMongoose.mongooseCache = cache;

export async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  if (cache.conn) return cache.conn;
  cache.promise ??= mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false
  });
  cache.conn = await cache.promise;
  return cache.conn;
}

export async function requireMongo() {
  const connection = await connectMongo();
  if (!connection) {
    throw new Error("MONGODB_URI is required for user-owned GigShield data.");
  }
  return connection;
}

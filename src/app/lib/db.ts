import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!MONGODB_URI)
  throw new Error(
    "Please define the MONGODB_URI or DATABASE_URL environment variable"
  );

declare global {

  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global.mongooseCache) {
  global.mongooseCache = { conn: null, promise: null };
}

export async function dbConnect() {
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }
  if (!global.mongooseCache.promise) {
    global.mongooseCache.promise = mongoose.connect(MONGODB_URI);
  }
  global.mongooseCache.conn = await global.mongooseCache.promise;
  return global.mongooseCache.conn;
}

export async function getMongoClient() {
  const conn = await dbConnect();
  return (conn.connection as any).getClient();
}

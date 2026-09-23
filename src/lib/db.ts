import mongoose from "mongoose";
import fs from "fs";
import path from "path";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined; // eslint-disable-line no-var
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

function getMongoUri(): string | undefined {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const match = content.match(/^\s*MONGODB_URI\s*=\s*(.*)$/m);
      if (match && match[1]) {
        const val = match[1].trim().replace(/^["']|["']$/g, "");
        if (val) return val;
      }
    }
  } catch {
    // fallback to process.env
  }
  return process.env.MONGODB_URI;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = getMongoUri();

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  // Extract target database name from uri
  const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
  const targetDb = dbMatch ? dbMatch[1] : undefined;

  if (mongoose.connection.readyState === 1) {
    if (!targetDb || mongoose.connection.name === targetDb) {
      cached.conn = mongoose;
      return cached.conn;
    }
    // If connected to different database (e.g. leftover 'admin' system DB), disconnect first
    await mongoose.disconnect();
    cached.promise = null;
    cached.conn = null;
  }

  // If disconnected or failed, force clear
  if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
    cached.promise = null;
    cached.conn = null;
  }


  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
      })
      .then((m) => {
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }
}



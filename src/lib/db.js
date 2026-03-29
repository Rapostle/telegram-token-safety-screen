import { MongoClient } from "mongodb";
import { cfg } from "./config.js";

let client = null;
let db = null;

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export async function connectDb() {
  if (db) return db;
  if (!cfg.MONGODB_URI) {
    throw new Error("MONGODB_URI is required for this bot.");
  }

  try {
    client = new MongoClient(cfg.MONGODB_URI, { maxPoolSize: 10, ignoreUndefined: true });
    await client.connect();
    db = client.db();
    console.log("[db] connected", { mongoConfigured: true });
    return db;
  } catch (err) {
    console.error("[db] connect failed", { err: safeErr(err) });
    throw err;
  }
}

export async function getDb() {
  if (db) return db;
  return connectDb();
}

export async function ensureIndexes() {
  const database = await getDb();
  try {
    await database.collection("scan_history").createIndex({ userId: 1, requestedAt: -1 });
    await database.collection("scan_history").createIndex({ chatId: 1, requestedAt: -1 });
    await database.collection("scan_cache").createIndex({ chain: 1, address: 1 }, { unique: true });
    await database.collection("scan_cache").createIndex({ updatedAt: -1 });
    await database.collection("memory_messages").createIndex({ platform: 1, userId: 1, chatId: 1, ts: -1 });
    console.log("[db] indexes ensured");
  } catch (err) {
    console.error("[db] ensureIndexes failed", { err: safeErr(err) });
    throw err;
  }
}

export async function closeDb() {
  if (!client) return;
  await client.close();
  client = null;
  db = null;
  console.log("[db] closed");
}

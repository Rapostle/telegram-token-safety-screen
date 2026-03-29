import { getDb } from "./db.js";

const COL = "memory_messages";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export async function addTurn({ mongoUri, platform, userId, chatId, role, text }) {
  const db = await getDb();
  const doc = {
    platform,
    userId: String(userId || ""),
    chatId: String(chatId || ""),
    role,
    text: String(text || "").slice(0, 4000),
    ts: new Date()
  };

  try {
    await db.collection(COL).insertOne(doc);
  } catch (err) {
    console.error("[db] write failed", { collection: COL, operation: "insertOne", err: safeErr(err) });
  }
}

export async function clearUserMemory({ platform, userId, chatId }) {
  const db = await getDb();
  const query = {
    platform,
    userId: String(userId || ""),
    chatId: String(chatId || "")
  };

  try {
    await db.collection(COL).deleteMany(query);
  } catch (err) {
    console.error("[db] write failed", { collection: COL, operation: "deleteMany", err: safeErr(err) });
    throw err;
  }
}

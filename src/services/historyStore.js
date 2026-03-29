import { getDb } from "../lib/db.js";

const COL = "scan_history";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export async function saveHistory(entry) {
  const db = await getDb();
  const doc = {
    userId: String(entry.userId || ""),
    chatId: String(entry.chatId || ""),
    address: String(entry.address || "").toLowerCase(),
    chain: String(entry.chain || "unknown"),
    overall: String(entry.overall || "Unknown"),
    requestedAt: new Date(),
    source: String(entry.source || "plain")
  };

  try {
    await db.collection(COL).insertOne(doc);
  } catch (err) {
    console.error("[db] write failed", { collection: COL, operation: "insertOne", err: safeErr(err) });
  }
}

export async function deleteHistoryForUser({ userId, chatId }) {
  const db = await getDb();
  try {
    await db.collection(COL).deleteMany({
      userId: String(userId || ""),
      chatId: String(chatId || "")
    });
  } catch (err) {
    console.error("[db] write failed", { collection: COL, operation: "deleteMany", err: safeErr(err) });
    throw err;
  }
}

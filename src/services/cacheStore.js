import { getDb } from "../lib/db.js";
import { cfg } from "../lib/config.js";

const COL = "scan_cache";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export async function getCachedScan({ chain, address }) {
  const db = await getDb();
  try {
    const row = await db.collection(COL).findOne({
      chain: String(chain || "unknown"),
      address: String(address || "").toLowerCase()
    });

    if (!row) return null;
    const maxAgeMs = Number(cfg.CACHE_TTL_SECONDS || 900) * 1000;
    const updatedAt = row.updatedAt ? new Date(row.updatedAt).getTime() : 0;
    if (!updatedAt || Date.now() - updatedAt > maxAgeMs) return null;
    return row.result || null;
  } catch (err) {
    console.error("[db] read failed", { collection: COL, operation: "findOne", err: safeErr(err) });
    return null;
  }
}

export async function saveCachedScan({ chain, address, result }) {
  const db = await getDb();
  const mutable = {
    chain: String(chain || "unknown"),
    address: String(address || "").toLowerCase(),
    result,
    updatedAt: new Date()
  };

  delete mutable._id;
  delete mutable.createdAt;

  try {
    await db.collection(COL).updateOne(
      {
        chain: String(chain || "unknown"),
        address: String(address || "").toLowerCase()
      },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: mutable
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("[db] write failed", { collection: COL, operation: "updateOne", err: safeErr(err) });
  }
}

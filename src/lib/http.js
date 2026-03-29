import { cfg } from "./config.js";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export async function fetchJson(url, options = {}) {
  const timeoutMs = Number(options.timeoutMs || cfg.REQUEST_TIMEOUT_MS || 20000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!response.ok) {
      const err = json?.error?.message || json?.message || text || `HTTP ${response.status}`;
      throw new Error(String(err));
    }

    return json;
  } catch (err) {
    throw new Error(safeErr(err));
  } finally {
    clearTimeout(timer);
  }
}

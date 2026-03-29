import { cfg } from "../lib/config.js";
import { isProbablyAddress, parseAddressInput, shouldHandleGroupMessage } from "../lib/validate.js";
import { screenToken } from "../services/tokenScreener.js";
import { formatScreenReport } from "../lib/format.js";
import { addTurn } from "../lib/memory.js";

const chatLocks = new Map();
let globalInFlight = 0;
const GLOBAL_CAP = 2;

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error("Screening timed out"));
      }, timeoutMs);
    })
  ]);
}

export function registerScreenerHandlers(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message?.text?.trim() || "";
    if (!text) return next();
    if (text.startsWith("/")) return next();
    if (!shouldHandleGroupMessage(ctx)) return next();
    if (!isProbablyAddress(text)) return next();
    await handleScreeningRequest(ctx, text, "plain");
  });
}

export async function handleScreeningRequest(ctx, rawInput, source = "plain") {
  const chatId = String(ctx.chat?.id || "");
  const userId = String(ctx.from?.id || "");
  const timeoutMs = Number(cfg.REQUEST_TIMEOUT_MS || 20000);

  if (chatLocks.has(chatId)) {
    await ctx.reply("I’m working on your last request. Please wait a moment.");
    return;
  }

  if (globalInFlight >= GLOBAL_CAP) {
    await ctx.reply("Busy right now. Please try again in a moment.");
    return;
  }

  const parsed = parseAddressInput(rawInput);
  console.log("[screening] request received", {
    source,
    chatId,
    userId,
    hasInput: Boolean(rawInput)
  });

  if (!parsed.ok) {
    console.log("[screening] validation failed", { source, chatId, userId });
    await ctx.reply(
      "That doesn’t look like a valid supported contract address. Send an EVM address like 0x1234...abcd or use /check <address>."
    );
    return;
  }

  chatLocks.set(chatId, true);
  globalInFlight += 1;

  try {
    await addTurn({
      mongoUri: cfg.MONGODB_URI,
      platform: "telegram",
      userId,
      chatId,
      role: "user",
      text: rawInput
    });

    console.log("[screening] validation success", {
      chatId,
      userId,
      chain: parsed.chain,
      address: parsed.address
    });

    await ctx.reply("Checking that token now...");

    const result = await withTimeout(
      screenToken({
        address: parsed.address,
        chainHint: parsed.chain,
        userId,
        chatId,
        source
      }),
      timeoutMs
    );

    const message = formatScreenReport(result);
    await ctx.reply(message, {
      disable_web_page_preview: true
    });

    await addTurn({
      mongoUri: cfg.MONGODB_URI,
      platform: "telegram",
      userId,
      chatId,
      role: "assistant",
      text: message
    });

    console.log("[screening] response sent", {
      chatId,
      userId,
      chain: result.chain,
      address: result.address,
      overall: result.overall
    });
  } catch (err) {
    console.error("[screening] failed", { err: safeErr(err), chatId, userId });
    await ctx.reply(
      "I couldn’t complete that screen right now. If data sources are slow or unavailable, try again shortly."
    );
  } finally {
    chatLocks.delete(chatId);
    globalInFlight = Math.max(0, globalInFlight - 1);
  }
}

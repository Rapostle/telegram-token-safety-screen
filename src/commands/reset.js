import { clearUserMemory } from "../lib/memory.js";
import { cfg } from "../lib/config.js";
import { deleteHistoryForUser } from "../services/historyStore.js";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export default function register(bot) {
  bot.command("reset", async (ctx) => {
    try {
      await clearUserMemory({
        mongoUri: cfg.MONGODB_URI,
        platform: "telegram",
        userId: ctx.from?.id,
        chatId: ctx.chat?.id
      });
      await deleteHistoryForUser({
        userId: ctx.from?.id,
        chatId: ctx.chat?.id
      });
      await ctx.reply("Your stored lookup memory was cleared for this chat.");
    } catch (err) {
      console.error("[reset] failed", { err: safeErr(err) });
      await ctx.reply("I could not clear your history right now. Please try again.");
    }
  });
}

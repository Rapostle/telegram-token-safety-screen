import { handleScreeningRequest } from "../features/screener.js";

export default function register(bot) {
  bot.command("check", async (ctx) => {
    const text = ctx.message?.text || "";
    const parts = text.trim().split(/\s+/);
    const address = parts[1] || "";
    await handleScreeningRequest(ctx, address, "command");
  });
}

import { Bot } from "grammy";
import { registerCommands } from "./commands/loader.js";
import { registerScreenerHandlers } from "./features/screener.js";

export function createBot(token) {
  const bot = new Bot(token);

  registerCommands(bot);
  registerScreenerHandlers(bot);

  return bot;
}

export function getBotProfile() {
  return [
    "Purpose: screen crypto token contract addresses for conservative safety signals and return a concise Telegram risk summary.",
    "Public commands: /start, /help, /check <address>, /reset.",
    "Features: plain-address input, contract validation, chain inference, ownership check, liquidity lock or burn check, top-10 holder concentration check, Mongo-backed history and cache.",
    "Rules: unsupported or unverifiable data must be reported as UNKNOWN or WARN, not safe. Results are informational only and not financial advice. In groups, the bot only responds to contract-address messages or explicit commands."
  ].join(" ");
}

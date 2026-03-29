export default function register(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(
      [
        "Supported checks:",
        "1) ownership renounced",
        "2) liquidity locked or burned",
        "3) top 10 holders <= 25%",
        "",
        "Supported input:",
        "1) plain contract address message",
        "2) /check <address>",
        "",
        "Current limitations:",
        "1) chain support is conservative and depends on configured providers",
        "2) missing explorer, RPC, holder, or LP data may produce UNKNOWN or WARN",
        "3) unsupported chains will be rejected clearly",
        "",
        "Examples:",
        "/check 0x1234567890abcdef1234567890abcdef12345678",
        "0x1234567890abcdef1234567890abcdef12345678"
      ].join("\n")
    );
  });
}

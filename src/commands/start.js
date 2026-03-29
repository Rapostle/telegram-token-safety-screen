export default function register(bot) {
  bot.command("start", async (ctx) => {
    await ctx.reply(
      [
        "Welcome. I screen token contract addresses for basic safety signals.",
        "",
        "I check:",
        "1) ownership renounced",
        "2) liquidity locked or burned",
        "3) whether the top 10 holders appear to control more than 25%",
        "",
        "Send a token contract address as a plain message, or use /check <address>.",
        "",
        "Results are informational only and not financial advice. Unknown or missing data will not be treated as safe."
      ].join("\n")
    );
  });
}

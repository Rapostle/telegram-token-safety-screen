import "dotenv/config";
import { run } from "@grammyjs/runner";

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

process.on("unhandledRejection", (err) => {
  console.error("[process] unhandledRejection", { err: safeErr(err) });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("[process] uncaughtException", { err: safeErr(err) });
  process.exit(1);
});

async function boot() {
  try {
    console.log("[boot] start");
    const [{ cfg }, { createBot }, { connectDb, ensureIndexes, closeDb }] = await Promise.all([
      import("./lib/config.js"),
      import("./bot.js"),
      import("./lib/db.js")
    ]);

    console.log("[boot] config", {
      telegramTokenSet: Boolean(cfg.TELEGRAM_BOT_TOKEN),
      mongodbUriSet: Boolean(cfg.MONGODB_URI),
      supportedChains: cfg.SUPPORTED_CHAINS,
      hasDexscreenerBase: Boolean(cfg.DEXSCREENER_API_BASE)
    });

    if (!cfg.TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN is required. Add it to your environment and redeploy.");
      process.exit(1);
    }

    try {
      await connectDb();
      await ensureIndexes();
    } catch (err) {
      console.error("[db] startup failure", { err: safeErr(err) });
      process.exit(1);
    }

    const bot = createBot(cfg.TELEGRAM_BOT_TOKEN);

    bot.catch((err) => {
      console.error("[telegram] bot error", {
        err: safeErr(err?.error || err)
      });
    });

    let runner = null;
    let restarting = false;
    let backoffMs = 2000;

    const stopRunner = async () => {
      if (!runner) return;
      try {
        await runner.stop();
      } catch (err) {
        console.error("[polling] stop failure", { err: safeErr(err) });
      }
      runner = null;
    };

    const startPolling = async () => {
      if (runner || restarting) return;
      restarting = true;
      try {
        await bot.init();
        await bot.api.deleteWebhook({ drop_pending_updates: true });
        console.log("[polling] webhook cleared");

        runner = run(bot, {
          runner: {
            fetch: {
              allowed_updates: ["message", "callback_query"]
            }
          },
          concurrency: 1
        });

        console.log("[polling] started", { concurrency: 1 });
        backoffMs = 2000;
      } catch (err) {
        const msg = safeErr(err);
        console.error("[polling] start failure", { err: msg, backoffMs });
        await stopRunner();
        setTimeout(() => {
          restarting = false;
          startPolling().catch((e) => {
            console.error("[polling] restart failure", { err: safeErr(e) });
          });
        }, backoffMs);
        backoffMs = Math.min(backoffMs === 2000 ? 5000 : backoffMs * 2, 20000);
        return;
      }
      restarting = false;
    };

    const memTimer = setInterval(() => {
      const m = process.memoryUsage();
      console.log("[mem]", {
        rssMB: Math.round(m.rss / 1e6),
        heapUsedMB: Math.round(m.heapUsed / 1e6)
      });
    }, 60_000);

    memTimer.unref?.();

    const shutdown = async (signal) => {
      console.log("[shutdown] signal", { signal });
      clearInterval(memTimer);
      await stopRunner();
      await closeDb();
      process.exit(0);
    };

    process.on("SIGINT", () => {
      shutdown("SIGINT").catch((err) => {
        console.error("[shutdown] failure", { err: safeErr(err) });
        process.exit(1);
      });
    });

    process.on("SIGTERM", () => {
      shutdown("SIGTERM").catch((err) => {
        console.error("[shutdown] failure", { err: safeErr(err) });
        process.exit(1);
      });
    });

    await startPolling();
  } catch (err) {
    console.error("[boot] fatal", {
      err: safeErr(err),
      code: err?.code || ""
    });
    if (err?.code === "ERR_MODULE_NOT_FOUND") {
      console.error("Check that all relative imports include .js extensions and files exist under src/.");
    }
    process.exit(1);
  }
}

boot();

This bot screens crypto token contract addresses for basic safety-oriented signals and returns a concise risk summary in Telegram.

Public commands:

1) /start
What it does: welcomes the user, explains what the bot checks, how to submit a token address, and shows an informational disclaimer.
Arguments: none.

2) /help
What it does: lists supported checks, input formats, limitations, and examples.
Arguments: none.

3) /check <address>
What it does: runs the token screening flow for a contract address.
Arguments: a token contract address.

4) /reset
What it does: clears stored lookup memory and lightweight history for the current user/chat.
Arguments: none.

Plain message support:
You can also send a token contract address as a plain text message. The bot will validate it and run the same screening pipeline.

Checks performed:

1) Ownership renounced
PASS, WARN, FAIL, or UNKNOWN depending on whether ownership can be verified as renounced.

2) Liquidity locked or burned
PASS, WARN, FAIL, or UNKNOWN depending on available liquidity and LP custody evidence.

3) Top 10 holders <= 25%
PASS, FAIL, or UNKNOWN depending on holder concentration data.

4) Overall summary
The bot returns one of: Low Confidence Safe, Caution, High Risk, or Unknown.

Limitations:

1) The bot is conservative. Missing data does not produce a strong safe verdict.
2) Some checks require optional chain RPC or explorer data sources.
3) Unsupported chains or incomplete external data can produce UNKNOWN or WARN results.
4) Results are informational only and not financial advice.

Environment variables:

1) TELEGRAM_BOT_TOKEN
Required. Telegram bot token.

2) MONGODB_URI
Required. MongoDB connection used for lookup history and cached scan results.

3) SUPPORTED_CHAINS
Optional. Comma-separated configured chains. Default: evm.

4) EVM_RPC_URL
Optional. Generic EVM RPC URL fallback.

5) ETH_RPC_URL, BSC_RPC_URL, BASE_RPC_URL, ARB_RPC_URL, POLYGON_RPC_URL
Optional. Per-chain RPC URLs.

6) ETHERSCAN_API_KEY, BSCSCAN_API_KEY, BASESCAN_API_KEY, ARBISCAN_API_KEY, POLYGONSCAN_API_KEY
Optional. Explorer API keys used if present.

7) DEXSCREENER_API_BASE
Optional. Base URL for liquidity pair discovery. Default: https://api.dexscreener.com/latest

8) CACHE_TTL_SECONDS
Optional. Cache freshness window. Default: 900.

9) REQUEST_TIMEOUT_MS
Optional. HTTP/RPC timeout. Default: 20000.

Setup and run:

1) Install dependencies with npm install
2) Copy .env.sample to .env
3) Set TELEGRAM_BOT_TOKEN and MONGODB_URI
4) Start with npm run dev or npm start

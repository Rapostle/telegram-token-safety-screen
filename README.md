# Token Safety Bot

Telegram bot for screening crypto token contract addresses for basic safety signals.

## Features

- Accepts a plain token contract address in chat
- Supports `/check <address>` and `/reset`
- Screens for:
  - ownership renounced
  - liquidity locked or burned
  - top 10 holders concentration <= 25%
- Returns conservative PASS / WARN / FAIL / UNKNOWN results
- Uses MongoDB for lookup history and cached scan results
- Long polling with grammY runner-safe boot flow and diagnostics

## Architecture

- `src/index.js`: boot, env validation, polling lifecycle, global error handlers
- `src/bot.js`: Telegram bot wiring and feature registration
- `src/commands/*.js`: public Telegram commands
- `src/features/screener.js`: plain-text and command-driven screening flow
- `src/services/*.js`: token analysis services and provider access
- `src/lib/*.js`: config, db, logging, formatting, bot profile, helpers

## Setup

### Prerequisites

- Node.js 18+
- Telegram bot token from BotFather
- MongoDB connection string

### Install

bash
npm install


### Configure

Copy `.env.sample` to `.env` and fill in values:

- `TELEGRAM_BOT_TOKEN`: Telegram bot token
- `MONGODB_URI`: MongoDB connection string
- `SUPPORTED_CHAINS`: optional comma-separated chains, default `evm`
- `EVM_RPC_URL`: optional generic EVM RPC URL fallback
- `ETH_RPC_URL`, `BSC_RPC_URL`, `BASE_RPC_URL`, `ARB_RPC_URL`, `POLYGON_RPC_URL`: optional per-chain RPC URLs
- `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY`, `BASESCAN_API_KEY`, `ARBISCAN_API_KEY`, `POLYGONSCAN_API_KEY`: optional explorer keys
- `DEXSCREENER_API_BASE`: optional Dexscreener base URL
- `CACHE_TTL_SECONDS`: optional cache freshness seconds
- `REQUEST_TIMEOUT_MS`: optional network timeout

### Run

bash
npm run dev


Production:

bash
npm start


## Commands

- `/start` — welcome, what the bot checks, how to submit an address, disclaimer
- `/help` — supported checks, input formats, limitations, examples
- `/check <address>` — run a token screening manually
- `/reset` — clear your stored lookup memory/history

Examples:

text
/start
/help
/check 0x1234567890abcdef1234567890abcdef12345678
0x1234567890abcdef1234567890abcdef12345678


Expected output includes:

- token address
- network/chain
- ownership renounced
- liquidity locked or burned
- top 10 holders <= 25%
- overall summary label
- notes for missing or uncertain data

## Integrations

- Telegram Bot API via grammY
- MongoDB for history and cache
- Optional EVM RPC and explorer sources
- Optional Dexscreener API for liquidity pair discovery

## Database

Collections:

- `scan_history`: user lookup history
- `scan_cache`: cached recent scan results
- `memory_messages`: lightweight bot memory/history

Indexes created programmatically:

- `scan_history`: `userId`, `chatId`, `requestedAt`
- `scan_cache`: `chain`, `address`, `updatedAt`
- `memory_messages`: `platform`, `userId`, `chatId`, `ts`

No `_id` index is manually created.

## Deployment

Set environment variables on Render or your host:

- `TELEGRAM_BOT_TOKEN`
- `MONGODB_URI`

Optional provider env vars can be added later. The bot still boots without them, but some checks may return `UNKNOWN`.

## Troubleshooting

- If boot fails, confirm `TELEGRAM_BOT_TOKEN` is set.
- If scans return many `UNKNOWN` values, set RPC and explorer env vars.
- If MongoDB is unavailable, the bot will warn and continue with limited in-memory behavior.
- Check logs for startup, polling, DB, and screening diagnostics.

## Extending

Add new commands in `src/commands/` and register them through `src/commands/loader.js`.
Add new screening sources or rule logic in `src/services/`.

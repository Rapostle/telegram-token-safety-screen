const splitList = (value, fallback = []) => {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
};

export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  MONGODB_URI: process.env.MONGODB_URI || "",
  SUPPORTED_CHAINS: splitList(process.env.SUPPORTED_CHAINS || "evm", ["evm"]),
  EVM_RPC_URL: process.env.EVM_RPC_URL || "",
  ETH_RPC_URL: process.env.ETH_RPC_URL || "",
  BSC_RPC_URL: process.env.BSC_RPC_URL || "",
  BASE_RPC_URL: process.env.BASE_RPC_URL || "",
  ARB_RPC_URL: process.env.ARB_RPC_URL || "",
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "",
  ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || "",
  BSCSCAN_API_KEY: process.env.BSCSCAN_API_KEY || "",
  BASESCAN_API_KEY: process.env.BASESCAN_API_KEY || "",
  ARBISCAN_API_KEY: process.env.ARBISCAN_API_KEY || "",
  POLYGONSCAN_API_KEY: process.env.POLYGONSCAN_API_KEY || "",
  DEXSCREENER_API_BASE: process.env.DEXSCREENER_API_BASE || "https://api.dexscreener.com/latest",
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 900),
  REQUEST_TIMEOUT_MS: Number(process.env.REQUEST_TIMEOUT_MS || 20000)
};

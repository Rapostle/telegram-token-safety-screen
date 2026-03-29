import { cfg } from "../lib/config.js";
import { fetchJson } from "../lib/http.js";

const CHAIN_CONFIG = {
  evm: {
    chain: "evm",
    rpcUrl: cfg.EVM_RPC_URL || cfg.ETH_RPC_URL || cfg.BSC_RPC_URL || cfg.BASE_RPC_URL || cfg.ARB_RPC_URL || cfg.POLYGON_RPC_URL || ""
  }
};

function safeErr(err) {
  return err?.response?.data?.error?.message || err?.response?.data?.message || err?.message || String(err);
}

export function inferChain(address, chainHint = "") {
  if (!address?.startsWith("0x")) {
    return { supported: false, chain: "unknown", reason: "unsupported_address_format" };
  }

  const requested = String(chainHint || "evm").toLowerCase();
  if (!cfg.SUPPORTED_CHAINS.includes(requested)) {
    return {
      supported: false,
      chain: requested,
      reason: `unsupported chain: ${requested}`
    };
  }

  return {
    supported: true,
    chain: requested,
    config: CHAIN_CONFIG[requested] || CHAIN_CONFIG.evm
  };
}

export async function discoverLiquidityPairs(chain, address) {
  const base = String(cfg.DEXSCREENER_API_BASE || "https://api.dexscreener.com/latest").replace(/\/+$/, "");
  const url = `${base}/dex/tokens/${address}`;
  console.log("[provider] liquidity lookup start", { chain, address, hasBase: Boolean(base) });

  try {
    const data = await fetchJson(url);
    const pairs = Array.isArray(data?.pairs) ? data.pairs : [];
    console.log("[provider] liquidity lookup success", { chain, address, pairCount: pairs.length });
    return pairs;
  } catch (err) {
    console.error("[provider] liquidity lookup failure", { chain, address, err: safeErr(err) });
    return [];
  }
}

export async function fetchOwnershipData(chain, address) {
  console.log("[provider] ownership lookup start", { chain, address });
  try {
    const rpcUrl = (CHAIN_CONFIG[chain] || CHAIN_CONFIG.evm || {}).rpcUrl || "";
    if (!rpcUrl) {
      return { owner: "", source: "none", verifiable: false, note: "No RPC URL configured." };
    }

    console.log("[provider] ownership lookup success", { chain, address, rpcConfigured: true });
    return { owner: "", source: "rpc", verifiable: false, note: "Ownership RPC probe not configured for contract ABI discovery yet." };
  } catch (err) {
    console.error("[provider] ownership lookup failure", { chain, address, err: safeErr(err) });
    return { owner: "", source: "error", verifiable: false, note: safeErr(err) };
  }
}

export async function fetchHolderData(chain, address) {
  console.log("[provider] holder lookup start", { chain, address });
  try {
    console.log("[provider] holder lookup success", { chain, address, available: false });
    return { available: false, holders: [], note: "Holder distribution source is not configured." };
  } catch (err) {
    console.error("[provider] holder lookup failure", { chain, address, err: safeErr(err) });
    return { available: false, holders: [], note: safeErr(err) };
  }
}

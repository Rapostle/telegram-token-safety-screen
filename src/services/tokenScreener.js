import { inferChain } from "./provider.js";
import { analyzeOwnership } from "./ownershipAnalyzer.js";
import { analyzeLiquidity } from "./liquidityAnalyzer.js";
import { analyzeHolders } from "./holderAnalyzer.js";
import { getCachedScan, saveCachedScan } from "./cacheStore.js";
import { saveHistory } from "./historyStore.js";
import { getBotProfile } from "../lib/botProfile.js";

function computeOverall({ ownership, liquidity, holders }) {
  const statuses = [ownership.status, liquidity.status, holders.status];
  if (statuses.includes("FAIL")) return "High Risk";
  if (statuses.includes("UNKNOWN")) return "Unknown";
  if (statuses.includes("WARN")) return "Caution";
  if (statuses.every((s) => s === "PASS")) return "Low Confidence Safe";
  return "Unknown";
}

export async function screenToken({ address, chainHint, userId, chatId, source }) {
  const chainInfo = inferChain(address, chainHint);
  if (!chainInfo.supported) {
    return {
      address,
      chain: chainInfo.chain,
      ownership: { status: "UNKNOWN" },
      liquidity: { status: "UNKNOWN" },
      holders: { status: "UNKNOWN" },
      overall: "Unknown",
      notes: [
        `Unsupported chain. Supported chains: ${chainInfo.chain === "unknown" ? "evm" : "evm"}.`,
        chainInfo.reason
      ],
      botProfile: getBotProfile()
    };
  }

  const cached = await getCachedScan({ chain: chainInfo.chain, address });
  if (cached) {
    await saveHistory({ userId, chatId, address, chain: chainInfo.chain, overall: cached.overall, source: `${source}:cache` });
    return {
      ...cached,
      notes: [...(cached.notes || []), "Returned from recent cache."]
    };
  }

  const [ownership, liquidity, holders] = await Promise.all([
    analyzeOwnership({ chain: chainInfo.chain, address }),
    analyzeLiquidity({ chain: chainInfo.chain, address }),
    analyzeHolders({ chain: chainInfo.chain, address })
  ]);

  const notes = [
    ...(ownership.notes || []),
    ...(liquidity.notes || []),
    ...(holders.notes || [])
  ];

  if (holders.status === "UNKNOWN") {
    notes.push("Unknown holder data does not produce a safe verdict.");
  }

  const result = {
    address,
    chain: chainInfo.chain,
    ownership,
    liquidity,
    holders,
    overall: computeOverall({ ownership, liquidity, holders }),
    notes,
    botProfile: getBotProfile()
  };

  await saveCachedScan({ chain: chainInfo.chain, address, result });
  await saveHistory({ userId, chatId, address, chain: chainInfo.chain, overall: result.overall, source });

  return result;
}

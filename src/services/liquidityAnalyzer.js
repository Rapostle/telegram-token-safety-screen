import { discoverLiquidityPairs } from "./provider.js";

const BURN_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead"
]);

export async function analyzeLiquidity({ chain, address }) {
  console.log("[analysis] liquidity start", { chain, address });
  const pairs = await discoverLiquidityPairs(chain, address);
  const notes = [];

  if (!pairs.length) {
    console.log("[analysis] liquidity success", { chain, address, status: "UNKNOWN" });
    return {
      status: "UNKNOWN",
      notes: ["No liquidity pair data was available."]
    };
  }

  const topPair = pairs[0] || {};
  const pairAddress = String(topPair.pairAddress || "").toLowerCase();
  const lpHolder = String(topPair.lpHolder || "").toLowerCase();
  const lockEnd = topPair.lockEndTime || null;

  let status = "WARN";

  if (lpHolder && BURN_ADDRESSES.has(lpHolder)) {
    status = "PASS";
    notes.push("LP tokens appear to be sent to a burn address.");
  } else if (lockEnd) {
    status = "PASS";
    notes.push(`Liquidity appears locked until ${new Date(Number(lockEnd) * 1000).toISOString()}.`);
  } else if (pairAddress) {
    status = "WARN";
    notes.push("Liquidity exists, but no strong lock or burn evidence was found.");
  } else {
    status = "UNKNOWN";
    notes.push("Liquidity data was incomplete.");
  }

  console.log("[analysis] liquidity success", { chain, address, status });
  return {
    status,
    notes,
    pairAddress: pairAddress || "unknown"
  };
}

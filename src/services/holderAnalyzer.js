import { fetchHolderData } from "./provider.js";

export async function analyzeHolders({ chain, address }) {
  console.log("[analysis] holders start", { chain, address });
  const data = await fetchHolderData(chain, address);

  if (!data?.available) {
    console.log("[analysis] holders success", { chain, address, status: "UNKNOWN" });
    return {
      status: "UNKNOWN",
      top10Percent: null,
      notes: [data?.note || "Holder data unavailable."]
    };
  }

  const holders = Array.isArray(data.holders) ? data.holders : [];
  const top10 = holders.slice(0, 10);
  const top10Percent = top10.reduce((sum, item) => sum + Number(item.percent || 0), 0);
  const status = top10Percent <= 25 ? "PASS" : "FAIL";

  console.log("[analysis] holders success", { chain, address, status, top10Percent });
  return {
    status,
    top10Percent,
    notes: [
      `Top 10 holders control about ${top10Percent.toFixed(2)}% based on the available holder data.`
    ]
  };
}

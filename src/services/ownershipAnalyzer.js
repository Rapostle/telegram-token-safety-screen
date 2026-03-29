import { fetchOwnershipData } from "./provider.js";

const RENOUNCED_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead"
]);

export async function analyzeOwnership({ chain, address }) {
  console.log("[analysis] ownership start", { chain, address });
  const data = await fetchOwnershipData(chain, address);

  let status = "UNKNOWN";
  const notes = [];
  const owner = String(data?.owner || "").toLowerCase();

  if (data?.verifiable && owner && RENOUNCED_ADDRESSES.has(owner)) {
    status = "PASS";
  } else if (data?.verifiable && owner) {
    status = "FAIL";
    notes.push(`Owner appears to be ${owner}.`);
  } else {
    status = "UNKNOWN";
    notes.push(data?.note || "Ownership could not be verified.");
  }

  console.log("[analysis] ownership success", { chain, address, status });
  return {
    status,
    owner: owner || "unknown",
    notes
  };
}

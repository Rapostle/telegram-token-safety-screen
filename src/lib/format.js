function lineStatus(label, value) {
  return `${label}: ${value}`;
}

export function formatScreenReport(result) {
  const notes = Array.isArray(result.notes) && result.notes.length
    ? result.notes.map((note, index) => `${index + 1}) ${note}`).join("\n")
    : "1) No extra notes.";

  return [
    "Token safety screen",
    "",
    lineStatus("Token address", result.address),
    lineStatus("Network", result.chain),
    lineStatus("Ownership renounced", result.ownership.status),
    lineStatus("Liquidity locked or burned", result.liquidity.status),
    lineStatus("Top 10 holders <= 25%", result.holders.status),
    lineStatus("Overall", result.overall),
    "",
    "Notes:",
    notes
  ].join("\n");
}

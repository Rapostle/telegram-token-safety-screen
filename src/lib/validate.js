const EVM_RE = /^0x[a-fA-F0-9]{40}$/;

export function isProbablyAddress(value) {
  return EVM_RE.test(String(value || "").trim());
}

export function parseAddressInput(value) {
  const raw = String(value || "").trim();
  if (!EVM_RE.test(raw)) {
    return { ok: false, reason: "invalid_address" };
  }

  return {
    ok: true,
    address: raw,
    chain: "evm"
  };
}

export function shouldHandleGroupMessage(ctx) {
  const chatType = ctx.chat?.type || "private";
  if (chatType === "private") return true;
  return true;
}

import dns from "node:dns/promises";
import net from "node:net";

function isBlockedIPv4(ip) {
  const parts = ip.split(".").map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return true;
  }

  const [a, b] = parts;

  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;

  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;

  return false;
}

function isBlockedIp(ip) {
  const version = net.isIP(ip);

  if (version === 4) {
    return isBlockedIPv4(ip);
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();

    if (normalized === "::1" || normalized === "::") {
      return true;
    }

    if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
      return true;
    }

    if (
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb")
    ) {
      return true;
    }
  }

  return false;
}

export async function ensurePublicUrl(url) {
  const hostname = url.hostname.toLowerCase();

  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("BLOCKED_TARGET");
  }

  const addresses = await dns.lookup(hostname, {
    all: true,
    verbatim: true
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isBlockedIp(address))
  ) {
    throw new Error("BLOCKED_TARGET");
  }
}
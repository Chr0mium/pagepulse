import dns from "node:dns/promises";
import net from "node:net";


function isBlockedIPv4(ip) {

  const parts = ip.split(".").map(Number);

  if (
    parts.length !== 4 ||
    parts.some(
      part =>
        !Number.isInteger(part) ||
        part < 0 ||
        part > 255
    )
  ) {
    return true;
  }

  const [a, b] = parts;

  if (a === 0) {
    return true;
  }

  if (a === 10) {
    return true;
  }

  if (
    a === 100 &&
    b >= 64 &&
    b <= 127
  ) {
    return true;
  }

  if (a === 127) {
    return true;
  }

  if (
    a === 169 &&
    b === 254
  ) {
    return true;
  }

  if (
    a === 172 &&
    b >= 16 &&
    b <= 31
  ) {
    return true;
  }

  if (
    a === 192 &&
    b === 168
  ) {
    return true;
  }

  if (a >= 224) {
    return true;
  }


  return false;
}


function isBlockedIPv6(ip) {

  const normalized =
    ip.toLowerCase().split("%")[0];

  if (normalized === "::") {
    return true;
  }

  if (normalized === "::1") {
    return true;
  }

  if (
    normalized.startsWith("fc") ||
    normalized.startsWith("fd")
  ) {
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

  if (normalized.startsWith("::ffff:")) {

    const ipv4 =
      normalized.substring(7);

    if (net.isIP(ipv4) === 4) {
      return isBlockedIPv4(ipv4);
    }

  }


  return false;
}


function isBlockedIp(ip) {

  const version = net.isIP(ip);

  if (version === 4) {
    return isBlockedIPv4(ip);
  }

  if (version === 6) {
    return isBlockedIPv6(ip);
  }

  return true;
}


export async function assertSafeUrl(url) {

  const hostname =
    url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost")
  ) {

    throw new Error("BLOCKED_TARGET");

  }

  const ipVersion =
    net.isIP(hostname);

  if (ipVersion) {

    if (isBlockedIp(hostname)) {
      throw new Error("BLOCKED_TARGET");
    }

    return;

  }

  let addresses;

  try {

    addresses = await dns.lookup(
      hostname,
      {
        all: true,
        verbatim: true
      }
    );

  } catch {

    const error =
      new Error("TARGET_DNS_FAILED");

    throw error;

  }


  if (!addresses.length) {

    throw new Error(
      "TARGET_DNS_FAILED"
    );

  }

  for (const result of addresses) {

    if (isBlockedIp(result.address)) {

      throw new Error(
        "BLOCKED_TARGET"
      );

    }

  }

}
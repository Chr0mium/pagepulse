export async function auditUrl(url) {
  const startedAt = Date.now();

  const response = await fetch(url, {
    redirect: "manual",
    headers: {
      "User-Agent": "PagePulseAuditor/1.0",
      "Accept": "text/html,application/xhtml+xml"
    }
  });

  const responseTimeMs = Date.now() - startedAt;

  return {
    url: url.toString(),
    status: response.status,
    reachable: true,
    responseTimeMs: responseTimeMs,
    contentType: response.headers.get("content-type"),
    https: url.protocol === "https:",
    redirected: response.status >= 300 && response.status < 400,
    auditedAt: new Date().toISOString()
  };
}
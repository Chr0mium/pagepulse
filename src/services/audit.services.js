import { assertSafeUrl } from "../security/url-security.js";


const MAX_REDIRECTS = 5;

const REQUEST_TIMEOUT_MS =
  Number(
    process.env.REQUEST_TIMEOUT_MS
  ) || 5000;


export async function auditUrl(inputUrl) {

  const startedAt = Date.now();

  let currentUrl =
    new URL(inputUrl.toString());

  let redirectCount = 0;


  while (true) {

    //Validate every destination BEFORE fetching it.

    await assertSafeUrl(currentUrl);

    const controller =
      new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );


    let response;

    try {

      response = await fetch(
        currentUrl,
        {
          redirect: "manual",

          signal:
            controller.signal,

          headers: {
            "User-Agent":
              "PagePulseAuditor/1.0",

            "Accept":
              "text/html,application/xhtml+xml"
          }
        }
      );

    } catch (error) {

      if (
        error.name === "AbortError"
      ) {

        throw new Error(
          "AUDIT_TIMEOUT"
        );

      }

      throw error;

    } finally {

      clearTimeout(timeout);

    }

    if (
      response.status >= 300 &&
      response.status < 400
    ) {

      const location =
        response.headers.get(
          "location"
        );

      if (!location) {

        return createResult(
          currentUrl,
          response,
          startedAt,
          redirectCount
        );

      }


      redirectCount++;

      if (
        redirectCount >
        MAX_REDIRECTS
      ) {

        throw new Error(
          "TOO_MANY_REDIRECTS"
        );

      }

      currentUrl =
        new URL(
          location,
          currentUrl
        );

      continue;

    }

    return createResult(
      currentUrl,
      response,
      startedAt,
      redirectCount
    );

  }

}


function createResult(
  url,
  response,
  startedAt,
  redirectCount
) {

  return {

    url:
      url.toString(),

    status:
      response.status,

    reachable:
      true,

    responseTimeMs:
      Date.now() - startedAt,

    contentType:
      response.headers.get(
        "content-type"
      ),

    https:
      url.protocol === "https:",

    redirected:
      redirectCount > 0,

    redirectCount,

    auditedAt:
      new Date().toISOString()

  };

}
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import { auditRateLimiter } from "./middleware/rate-limit.js";
import { errorHandler } from "./middleware/error-handler.js";

import { validateUrl } from "./validators/url-validator.js";
import { auditUrl } from "./services/audit.services.js";

import {
  getCachedAudit,
  setCachedAudit
} from "./cache/audit-cache.js";

import { createCacheKey } from "./utils/cache-key.js";
import { singleFlight } from "./services/single-flight.js";
import { auditLimiter } from "./concurrency/audit-limiter.js";


const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      process.env.ALLOWED_ORIGIN ||
      "http://localhost:3000"
  })
);

app.use(
  express.json({
    limit: "10kb"
  })
);

app.use(requestId);
app.use(requestLogger);

app.get("/health", (req, res) => {

  return res.status(200).json({
    ok: true,
    requestId: req.id,
    service: "pagepulse-api"
  });

});

app.post(
  "/api/v1/audits",

  auditRateLimiter,

  async (req, res, next) => {

    try {

      const { url } = req.body;
      const validation = validateUrl(url);

      if (!validation.valid) {

        return res.status(400).json({
          ok: false,
          requestId: req.id,
          error: {
            code: validation.code,
            message: validation.message
          }
        });

      }

      const key = createCacheKey(validation.url);
      const cachedResult = getCachedAudit(key);

      if (cachedResult) {

        return res.status(200).json({
          ok: true,
          requestId: req.id,
          cached: true,
          data: cachedResult
        });

      }

      const result = await singleFlight(
        key,

        async () => {

          const cached = getCachedAudit(key);

          if (cached) {

            return {
              data: cached,
              cached: true
            };

          }

          await auditLimiter.acquire();

          try {

            const auditResult =
              await auditUrl(validation.url);

            setCachedAudit(
              key,
              auditResult
            );

            return {
              data: auditResult,
              cached: false
            };

          } finally {
            auditLimiter.release();

          }

        }
      );

      return res.status(200).json({
        ok: true,
        requestId: req.id,
        cached: result.cached,
        data: result.data
      });


    } catch (error) {


      if (error.message === "BLOCKED_TARGET") {

        return res.status(403).json({
          ok: false,
          requestId: req.id,
          error: {
            code: "BLOCKED_TARGET",
            message:
              "This URL points to a network location that cannot be audited."
          }
        });

      }

      if (error.message === "AUDIT_TIMEOUT") {

        return res.status(504).json({
          ok: false,
          requestId: req.id,
          error: {
            code: "AUDIT_TIMEOUT",
            message:
              "The target website took too long to respond."
          }
        });

      }

      next(error);

    }

  }
);


app.use((req, res) => {

  return res.status(404).json({
    ok: false,
    requestId: req.id,
    error: {
      code: "NOT_FOUND",
      message:
        "The requested endpoint does not exist."
    }
  });

});


app.use(errorHandler);
export default app;
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
app.use(requestId);
app.use(requestLogger);
app.use(express.json());


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

      // GET URL FROM REQUEST
      const { url } = req.body;

      // VALIDATE URL
      const validation = validateUrl(url);

      // RETURN ERROR IF INVALID

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

      // CREATE CACHE KEY
      const key = createCacheKey(validation.url);

      // CHECK CACHE
      const cachedResult = getCachedAudit(key);

      if (cachedResult) {

        return res.status(200).json({
          ok: true,
          requestId: req.id,
          cached: true,
          data: cachedResult
        });

      }

      // RUN AUDIT

      const result = await singleFlight(
        key,
        async () => {

          await auditLimiter.acquire();

          try {

            return await auditUrl(
              validation.url
            );

          } finally {

            auditLimiter.release();

          }

        }
      );

      // SAVE RESULT TO CACHE

      setCachedAudit(key, result);

      // RETURN SUCCESS

      return res.status(200).json({
        ok: true,
        requestId: req.id,
        cached: false,
        data: result
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

      // TIMEOUT

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

app.use(errorHandler);
export default app;
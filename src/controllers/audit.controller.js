import { validateUrl } from "../validators/url-validator.js";
import { auditUrl } from "../services/audit.service.js";
import {
  getCachedAudit,
  setCachedAudit
} from "../cache/audit-cache.js";
import { createCacheKey } from "../utils/cache-key.js";
import { singleFlight } from "../services/single-flight.js";
import { auditLimiter } from "../concurrency/audit-limiter.js";

export async function auditController(req, res, next) {
  try {
    const validation = validateUrl(req.body?.url);

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

    const cached = getCachedAudit(key);

    if (cached) {
      return res.status(200).json({
        ok: true,
        requestId: req.id,
        cached: true,
        data: cached
      });
    }

    const result = await singleFlight(key, async () => {
      await auditLimiter.acquire();

      try {
        return await auditUrl(validation.url);
      } finally {
        auditLimiter.release();
      }
    });

    setCachedAudit(key, result);

    return res.status(200).json({
      ok: true,
      requestId: req.id,
      cached: false,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
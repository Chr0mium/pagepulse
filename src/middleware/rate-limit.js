import { rateLimit } from "express-rate-limit";

export const auditRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,

  limit: Number(process.env.RATE_LIMIT_MAX) || 20,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      ok: false,
      requestId: req.id,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many audit requests. Please try again later."
      }
    });
  }
});
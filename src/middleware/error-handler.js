import logger from "../utils/logger.js";

export function errorHandler(err, req, res, next) {
  logger.error({
    event: "request.failed",
    requestId: req.id,
    code: err.code || "INTERNAL_ERROR",
    message: err.message
  });

  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";

  res.status(status).json({
    ok: false,
    requestId: req.id,
    error: {
      code,
      message:
        status === 500
          ? "An unexpected server error occurred."
          : err.message
    }
  });
}
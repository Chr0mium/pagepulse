import crypto from "node:crypto";

export function requestId(req, res, next) {
  const id = crypto.randomUUID();

  req.id = id;

  res.setHeader("X-Request-ID", id);

  next();
}
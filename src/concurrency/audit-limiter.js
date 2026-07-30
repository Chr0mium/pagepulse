import { Semaphore } from "./semaphore.js";

const limit =
  Number(process.env.MAX_CONCURRENT_AUDITS) || 10;

export const auditLimiter = new Semaphore(limit);
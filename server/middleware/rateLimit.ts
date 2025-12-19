import { type Request, type Response, type NextFunction } from 'express';

type Bucket = { count: number; resetAt: number };

let windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
let maxRequests = Number(process.env.RATE_LIMIT_MAX ?? 120);
const buckets = new Map<string, Bucket>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = `${req.ip}:${req.path}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (bucket.count >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }

  bucket.count += 1;
  buckets.set(key, bucket);
  next();
}

export function resetRateLimiter() {
  buckets.clear();
}

export function configureRateLimiter(options: { windowMs?: number; maxRequests?: number }) {
  if (options.windowMs) windowMs = options.windowMs;
  if (options.maxRequests) maxRequests = options.maxRequests;
  resetRateLimiter();
}

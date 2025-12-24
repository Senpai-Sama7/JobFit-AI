import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../logger';
import { RateLimitError } from '../error';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator?: (req: Request) => string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  handler?: (req: Request, res: Response) => void;
}

// In-memory store for rate limiting
// In production, this should be replaced with Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitRecord>();

// The periodic cleanup has been removed to prevent potential event loop blocking
// if the rateLimitStore grows very large. Expired entries for active keys are
// handled within the middleware logic itself. For a distributed system,
// a proper external store like Redis with TTL should be used.

/**
 * Default key generator - uses IP address and authenticated user ID
 */
function defaultKeyGenerator(req: Request): string {
  const userId = (req.user as { id?: number })?.id;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return userId ? `user:${userId}` : `ip:${ip}`;
}

/**
 * Create a rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    handler,
  } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = rateLimitStore.get(key);

    // Initialize or reset if window expired
    if (!record || record.resetAt <= now) {
      record = {
        count: 0,
        resetAt: now + windowMs,
      };
      rateLimitStore.set(key, record);
    }

    record.count++;

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, maxRequests - record.count);
    const resetTime = Math.ceil((record.resetAt - now) / 1000);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        count: record.count,
        limit: maxRequests,
        path: req.path,
      });

      res.setHeader('Retry-After', resetTime);

      if (handler) {
        handler(req, res);
      } else {
        res.status(429).json({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: resetTime,
          },
        });
      }
      return;
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const rateLimiters = {
  // Standard API rate limit - 100 requests per minute
  standard: rateLimit({
    windowMs: 60_000,
    maxRequests: 100,
  }),

  // Auth rate limit - 10 attempts per 15 minutes (brute force protection)
  auth: rateLimit({
    windowMs: 15 * 60_000,
    maxRequests: 10,
    keyGenerator: (req) => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      return `auth:${ip}`;
    },
  }),

  // Strict rate limit - 5 requests per minute (for expensive operations)
  strict: rateLimit({
    windowMs: 60_000,
    maxRequests: 5,
  }),

  // Upload rate limit - 10 uploads per hour
  upload: rateLimit({
    windowMs: 60 * 60_000,
    maxRequests: 10,
  }),

  // AI operations rate limit - 20 per hour (OpenAI API cost protection)
  ai: rateLimit({
    windowMs: 60 * 60_000,
    maxRequests: 20,
  }),
};

/**
 * Create a custom rate limiter
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  return rateLimit({ windowMs, maxRequests });
}

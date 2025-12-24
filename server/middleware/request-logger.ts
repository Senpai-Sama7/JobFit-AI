import { type Request, type Response, type NextFunction } from 'express';
import { logger } from '../logger';
import { randomBytes } from 'crypto';

// Extend Express Request type to include request ID
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Get the real IP address, handling proxies
 */
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded)) {
    return forwarded[0].split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Paths to exclude from detailed logging (reduce noise)
 */
const EXCLUDED_PATHS = [
  '/health',
  '/api/auth/session',
  '/favicon.ico',
];

/**
 * Check if path should be logged
 */
function shouldLog(path: string): boolean {
  return !EXCLUDED_PATHS.some(excluded => path.startsWith(excluded));
}

/**
 * Request logging middleware
 * Logs incoming requests and response times
 */
export function requestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate and attach request ID
    req.requestId = generateRequestId();
    req.startTime = Date.now();

    // Add request ID to response headers for tracing
    res.setHeader('X-Request-Id', req.requestId);

    // Skip logging for excluded paths
    if (!shouldLog(req.path)) {
      return next();
    }

    const clientIp = getClientIp(req);
    const userId = (req.user as { id?: number })?.id;

    // Log incoming request
    logger.debug(`Incoming request`, {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      ip: clientIp,
      userId,
      userAgent: req.headers['user-agent']?.substring(0, 50),
    });

    // Capture response on finish
    res.on('finish', () => {
      const duration = Date.now() - (req.startTime || 0);
      const statusCode = res.statusCode;

      // Use request method from logger for consistent formatting
      logger.request(req, statusCode, duration);
    });

    next();
  };
}

/**
 * Error request logging middleware (placed after routes, before error handler)
 * Logs requests that result in errors
 */
export function errorRequestLogger() {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const duration = Date.now() - (req.startTime || 0);
    const userId = (req.user as { id?: number })?.id;

    logger.error(`Request failed`, err, {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      duration,
      userId,
    });

    next(err);
  };
}

/**
 * Health check endpoint handler
 */
export function healthCheck() {
  return (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
    });
  };
}

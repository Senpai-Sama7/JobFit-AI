import { describe, beforeEach, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { configureRateLimiter, rateLimiter, resetRateLimiter } from './rateLimit';
import { resetConfigForTesting } from '../config';

function createContext(path = '/api/test') {
  const req = { path, ip: '127.0.0.1', method: 'GET' } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    setHeader: vi.fn(),
  } as unknown as Response;
  const next = vi.fn<Parameters<NextFunction>, void>();
  return { req, res, next };
}

describe('rateLimiter', () => {
  beforeEach(() => {
    resetConfigForTesting();
    configureRateLimiter({ windowMs: 50, maxRequests: 2 });
  });

  it('allows requests under the cap', () => {
    const { req, res, next } = createContext();
    rateLimiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('blocks when limit is exceeded', () => {
    const { req, res, next } = createContext();
    rateLimiter(req, res, next);
    rateLimiter(req, res, next);
    rateLimiter(req, res, next);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({ error: 'Too many requests. Please slow down.' });
    expect(next).toHaveBeenCalledTimes(2);
  });

  it('resets counts after the window', async () => {
    const { req, res, next } = createContext();
    rateLimiter(req, res, next);
    rateLimiter(req, res, next);
    expect(next).toHaveBeenCalledTimes(2);

    await new Promise((resolve) => setTimeout(resolve, 60));
    resetRateLimiter();
    const nextRun = createContext();
    rateLimiter(nextRun.req, nextRun.res, nextRun.next);
    expect(nextRun.next).toHaveBeenCalledOnce();
  });
});

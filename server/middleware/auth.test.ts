import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from './auth';
import { signJwt } from '../services/jwt';

function createContext(path = '/api/test', headers: Record<string, string> = {}) {
  const req = { path, headers } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn<Parameters<NextFunction>, void>();
  return { req, res, next };
}

describe('authMiddleware', () => {
  const secret = 'test-secret';

  beforeEach(() => {
    process.env.AUTH_JWT_SECRET = secret;
    delete process.env.API_SECRET_KEY;
  });

  afterEach(() => {
    delete process.env.AUTH_JWT_SECRET;
    delete process.env.API_SECRET_KEY;
  });

  it('skips non-API routes', () => {
    const { req, res, next } = createContext('/healthz');
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });

  it('rejects when secret is missing', () => {
    delete process.env.AUTH_JWT_SECRET;
    const { req, res, next } = createContext('/api/test');
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  it('requires bearer tokens', () => {
    const { req, res, next } = createContext('/api/test');
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing bearer token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid tokens', () => {
    const { req, res, next } = createContext('/api/test', { authorization: 'Bearer bad.token' });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('requires API key when configured', () => {
    process.env.API_SECRET_KEY = 'expected';
    const token = signJwt({}, secret, { subject: '5' });
    const { req, res, next } = createContext('/api/test', { authorization: `Bearer ${token}`, 'x-api-key': 'wrong' });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects expired tokens', () => {
    const expired = signJwt({}, secret, { subject: '9', expiresInSeconds: -10 });
    const { req, res, next } = createContext('/api/test', { authorization: `Bearer ${expired}` });
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('sets userId from token', () => {
    const token = signJwt({}, secret, { subject: '7' });
    const { req, res, next } = createContext('/api/test', { authorization: `Bearer ${token}` });
    authMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect((req as any).userId).toBe(7);
  });
});

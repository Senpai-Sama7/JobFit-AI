import { describe, expect, it } from 'vitest';
import { loadConfig, resetConfigForTesting } from './config';

describe('config loader', () => {
  it('provides defaults in test env', () => {
    const cfg = loadConfig({ NODE_ENV: 'test' });
    expect(cfg.authJwtSecret).toBeDefined();
    expect(cfg.rateLimitMax).toBeGreaterThan(0);
  });

  it('throws when required secrets are missing in production', () => {
    expect(() => loadConfig({ NODE_ENV: 'production' } as any)).toThrow(/AUTH_JWT_SECRET/);
  });

  it('allows overriding for tests', () => {
    resetConfigForTesting({ rateLimitMax: 10 });
    const cfg = loadConfig({ NODE_ENV: 'test', RATE_LIMIT_MAX: '5' });
    expect(cfg.rateLimitMax).toBe(5);
  });
});

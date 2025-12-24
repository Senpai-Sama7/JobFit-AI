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

  it('allows overriding for tests via getConfig', () => {
    resetConfigForTesting({ rateLimitMax: 10 });
    const cfg = getConfig();
    expect(cfg.rateLimitMax).toBe(10);
  });
});

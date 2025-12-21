import { z } from 'zod';

type Config = {
  authJwtSecret: string;
  apiSecretKey?: string;
  openaiApiKey?: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  exportMaxChars: number;
};

const schema = z.object({
  AUTH_JWT_SECRET: z.string().optional(),
  API_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().optional(),
  RATE_LIMIT_MAX: z.coerce.number().positive().optional(),
  EXPORT_MAX_CHARS: z.coerce.number().positive().optional(),
  NODE_ENV: z.string().optional(),
});

let cachedConfig: Config | null = null;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.parse(env);
  const isTest = parsed.NODE_ENV === 'test';
  const authJwtSecret = parsed.AUTH_JWT_SECRET || (isTest ? 'test-secret' : undefined);

  if (!authJwtSecret) {
    throw new Error('AUTH_JWT_SECRET is not configured');
  }

  const rateLimitWindowMs = parsed.RATE_LIMIT_WINDOW_MS ? Number(parsed.RATE_LIMIT_WINDOW_MS) : 60_000;
  const rateLimitMax = parsed.RATE_LIMIT_MAX ? Number(parsed.RATE_LIMIT_MAX) : 120;
  const exportMaxChars = parsed.EXPORT_MAX_CHARS ? Number(parsed.EXPORT_MAX_CHARS) : 200_000;

  if (Number.isNaN(rateLimitWindowMs) || rateLimitWindowMs <= 0) {
    throw new Error('RATE_LIMIT_WINDOW_MS must be a positive number');
  }
  if (Number.isNaN(rateLimitMax) || rateLimitMax <= 0) {
    throw new Error('RATE_LIMIT_MAX must be a positive number');
  }
  if (Number.isNaN(exportMaxChars) || exportMaxChars <= 0) {
    throw new Error('EXPORT_MAX_CHARS must be a positive number');
  }

  return {
    authJwtSecret,
    apiSecretKey: parsed.API_SECRET_KEY,
    openaiApiKey: parsed.OPENAI_API_KEY,
    rateLimitWindowMs,
    rateLimitMax,
    exportMaxChars,
  };
}

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

export function resetConfigForTesting(overrides?: Partial<Config>) {
  cachedConfig = {
    ...(loadConfig({ ...process.env, NODE_ENV: 'test' })),
    ...overrides,
  };
}

export function clearConfigCache() {
  cachedConfig = null;
}

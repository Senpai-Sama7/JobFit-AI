import { describe, expect, it } from 'vitest';
import { buildCsv, enforceExportLimit, sanitizeContent } from './exporter';

describe('exporter helpers', () => {
  it('sanitizes control characters and trims text', () => {
    const dirty = '\u0001Hello\nWorld\u0007 ';
    expect(sanitizeContent(dirty)).toBe('Hello\nWorld');
  });

  it('builds escaped csv rows', () => {
    const csv = buildCsv([
      ['resume'],
      ['Line "one" with comma, and newline\nsecond line'],
    ]);
    expect(csv).toBe('"resume"\n"Line ""one"" with comma, and newline\nsecond line"');
  });

  it('enforces export limit', () => {
    expect(() => enforceExportLimit('ok', 5)).not.toThrow();
    expect(() => enforceExportLimit('toolong', 3)).toThrowError(/maximum/);
  });
});

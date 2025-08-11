import { describe, expect, it } from 'vitest';
import { parseTailoringResponse } from './tailoring';

describe('parseTailoringResponse', () => {
  it('parses valid JSON', () => {
    const text = JSON.stringify({
      tailoredContent: 'Tailored',
      improvements: ['A', 'B'],
      atsScore: 90,
    });
    expect(parseTailoringResponse(text)).toEqual({
      tailoredContent: 'Tailored',
      improvements: ['A', 'B'],
      atsScore: 90,
    });
  });

  it('throws on invalid JSON', () => {
    expect(() => parseTailoringResponse('not json')).toThrow();
  });
});

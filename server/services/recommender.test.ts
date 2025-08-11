import { describe, expect, it } from 'vitest';
import { parseRecommendations } from './recommender';

describe('parseRecommendations', () => {
  it('parses list of recommendations', () => {
    const text = JSON.stringify([
      {
        jobTitle: 'Engineer',
        companyName: 'Corp',
        fitScore: 80,
        description: 'Build stuff',
        source: 'ai',
      },
    ]);
    expect(parseRecommendations(text)).toEqual([
      {
        jobTitle: 'Engineer',
        companyName: 'Corp',
        fitScore: 80,
        description: 'Build stuff',
        source: 'ai',
      },
    ]);
  });

  it('throws on invalid data', () => {
    expect(() => parseRecommendations('not json')).toThrow();
  });
});

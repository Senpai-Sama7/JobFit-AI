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

  it('normalizes fitScore and trims fields', () => {
    const text = JSON.stringify([
      {
        jobTitle: '  Engineer  ',
        companyName: ' Corp ',
        fitScore: 150,
        description: ' Build stuff ',
        source: ' ai ',
      },
      {
        jobTitle: 'Intern',
        companyName: 'Startup',
        fitScore: -20,
        description: 'Entry role',
        source: 'external',
      },
    ]);
    expect(parseRecommendations(text)).toEqual([
      {
        jobTitle: 'Engineer',
        companyName: 'Corp',
        fitScore: 100,
        description: 'Build stuff',
        source: 'ai',
      },
      {
        jobTitle: 'Intern',
        companyName: 'Startup',
        fitScore: 0,
        description: 'Entry role',
        source: 'external',
      },
    ]);
  });

  it('throws on invalid data', () => {
    expect(() => parseRecommendations('not json')).toThrow();
  });
});

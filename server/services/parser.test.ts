import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { extractParsedData } from './parserUtils';

// Load sample resume text for parsing tests
const sampleText = fs.readFileSync(
  path.resolve(__dirname, '../../sample_resume.txt'),
  'utf8'
);

describe('extractParsedData', () => {
  const parsed = extractParsedData(sampleText);

  it('should extract contact information', () => {
    expect(parsed.contact.name).toBe('JOHN SMITH');
    expect(parsed.contact.email).toBe('john.smith@email.com');
    expect(parsed.contact.phone).toBe('(555) 123-4567');
    expect(parsed.contact.location).toBe('San Francisco, CA');
    expect(parsed.contact.linkedin).toBe('linkedin.com/in/johnsmith');
    expect(parsed.contact.website).toBe('johnsmith.dev');
  });

  it('should extract a list of skills', () => {
    expect(parsed.skills).toEqual(
      expect.arrayContaining([
        'JavaScript',
        'TypeScript',
        'React',
        'Node.js',
        'PostgreSQL',
      ])
    );
    expect(parsed.skills.length).toBeGreaterThan(5);
  });

  it('should extract professional experience entries', () => {
    expect(parsed.experience.length).toBeGreaterThanOrEqual(3);
    const first = parsed.experience[0];
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('company');
    expect(first).toHaveProperty('startDate');
    expect(first).toHaveProperty('endDate');
    expect(Array.isArray(first.details)).toBe(true);
  });

  it('should extract education entries', () => {
    expect(parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(parsed.education[0]).toMatch(/Bachelor of Science/);
  });
});

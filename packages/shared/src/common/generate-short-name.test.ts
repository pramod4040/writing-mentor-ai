import { describe, it, expect } from 'vitest';
import { generateShortName } from './generate-short-name';

describe('generateShortName', () => {
  it('uses first non-empty line', () => {
    expect(generateShortName('Hello world\nsecond line')).toBe('Hello world');
  });

  it('truncates long lines', () => {
    const long = 'a'.repeat(60);
    expect(generateShortName(long).length).toBe(48);
    expect(generateShortName(long).endsWith('…')).toBe(true);
  });

  it('returns Untitled for empty text', () => {
    expect(generateShortName('   ')).toBe('Untitled');
  });
});

import { describe, expect, it } from 'vitest';
import { fuzzyMatchPercent, fuzzyMatchJsonPairsPercent } from './fuzzy-match.js';

describe('fuzzyMatchPercent', () => {
  it('returns 100 for exact normalized match', () => {
    expect(fuzzyMatchPercent('True', ' true ')).toBe(100);
  });

  it('returns lower score for different strings', () => {
    expect(fuzzyMatchPercent('hello', 'help')).toBeLessThan(90);
  });
});

describe('fuzzyMatchJsonPairsPercent', () => {
  it('averages pair scores', () => {
    const expected = JSON.stringify({ a: 'cat', b: 'dog' });
    const actual = JSON.stringify({ a: 'cat', b: 'dog' });
    expect(fuzzyMatchJsonPairsPercent(expected, actual)).toBe(100);
  });
});

import { describe, it, expect } from 'vitest';
import { countWords } from './count-words';

describe('countWords', () => {
  it('returns 0 for empty text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   ')).toBe(0);
  });

  it('counts words in text', () => {
    expect(countWords('one two three')).toBe(3);
  });
});

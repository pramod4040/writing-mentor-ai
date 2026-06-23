import { describe, expect, it } from 'vitest';
import { difficultyFromBand, DIFFICULTY_QUESTION_TYPES } from './difficulty.js';

describe('difficultyFromBand', () => {
  it('maps low band to beginner', () => {
    expect(difficultyFromBand(5)).toBe('beginner');
    expect(difficultyFromBand(5.4)).toBe('beginner');
  });

  it('maps mid band to intermediate', () => {
    expect(difficultyFromBand(5.5)).toBe('intermediate');
    expect(difficultyFromBand(6.5)).toBe('intermediate');
    expect(difficultyFromBand(null)).toBe('intermediate');
  });

  it('maps high band to advanced', () => {
    expect(difficultyFromBand(7)).toBe('advanced');
  });
});

describe('DIFFICULTY_QUESTION_TYPES', () => {
  it('has three levels with distinct types', () => {
    expect(DIFFICULTY_QUESTION_TYPES.beginner).toContain('mcq');
    expect(DIFFICULTY_QUESTION_TYPES.intermediate).toContain('matching');
    expect(DIFFICULTY_QUESTION_TYPES.advanced).toContain('short_answer');
  });
});

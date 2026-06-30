import { describe, expect, it } from 'vitest';
import {
  ALL_PRACTICE_QUESTION_TYPES,
  difficultyFromBand,
  DIFFICULTY_QUESTION_TYPES,
  pickRandomPracticeTypes,
} from './difficulty.js';

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

describe('ALL_PRACTICE_QUESTION_TYPES', () => {
  it('includes all 9 question types', () => {
    expect(ALL_PRACTICE_QUESTION_TYPES).toHaveLength(9);
    expect(ALL_PRACTICE_QUESTION_TYPES).toContain('error_detection');
  });
});

describe('pickRandomPracticeTypes', () => {
  it('returns requested count of unique types', () => {
    const types = pickRandomPracticeTypes(6);
    expect(types).toHaveLength(6);
    expect(new Set(types).size).toBe(6);
    types.forEach((t) => expect(ALL_PRACTICE_QUESTION_TYPES).toContain(t));
  });

  it('caps at available type count', () => {
    expect(pickRandomPracticeTypes(20)).toHaveLength(9);
  });
});

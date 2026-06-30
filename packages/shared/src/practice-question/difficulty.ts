import type { PracticeDifficulty, PracticeQuestionType } from './practice-question.schema.js';

export const ALL_PRACTICE_QUESTION_TYPES: PracticeQuestionType[] = [
  'mcq',
  'fill_blank',
  'true_false',
  'sentence_correction',
  'error_detection',
  'matching',
  'sentence_transformation',
  'cloze_passage',
  'short_answer',
];

export const DIFFICULTY_QUESTION_TYPES: Record<PracticeDifficulty, PracticeQuestionType[]> = {
  beginner: ['mcq', 'fill_blank', 'true_false'],
  intermediate: ['sentence_correction', 'error_detection', 'matching'],
  advanced: ['sentence_transformation', 'cloze_passage', 'short_answer'],
};

export function difficultyFromBand(band: number | null): PracticeDifficulty {
  if (band === null || Number.isNaN(band)) return 'intermediate';
  if (band < 5.5) return 'beginner';
  if (band <= 6.5) return 'intermediate';
  return 'advanced';
}

export function pickRandomPracticeTypes(count = 6): PracticeQuestionType[] {
  const shuffled = [...ALL_PRACTICE_QUESTION_TYPES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export const STRUCTURED_PRACTICE_TYPES: PracticeQuestionType[] = ['mcq', 'true_false', 'matching'];

export const AI_GRADED_PRACTICE_TYPES: PracticeQuestionType[] = [
  'fill_blank',
  'sentence_correction',
  'error_detection',
  'short_answer',
  'sentence_transformation',
  'cloze_passage',
];

export function isStructuredPracticeType(type: PracticeQuestionType): boolean {
  return STRUCTURED_PRACTICE_TYPES.includes(type);
}

import { describe, it, expect } from 'vitest';
import { structuredAiReviewSchema } from './ai-review.schema';

const sampleReview = {
  overallScore: 6.5,
  estimatedBand: 6.5,
  scores: {
    taskResponse: 6,
    grammar: 5.5,
    vocabulary: 6,
    cohesion: 6.5,
    structure: 6,
    formality: 7,
  },
  summary: {
    strengths: ['Clear purpose', 'Good structure'],
    weaknesses: ['Grammar errors', 'Limited vocabulary'],
  },
  priorityImprovements: ['Fix subject-verb agreement', 'Expand vocabulary'],
  mistakes: {
    grammar: ['Missing article before noun'],
    vocabulary: ['Informal word choice'],
  },
  feedback: ['Use more formal register', 'Add clearer transitions'],
  learningPlan: ['Practice timed writing', 'Review grammar patterns'],
};

describe('structuredAiReviewSchema', () => {
  it('parses valid structured review JSON', () => {
    const result = structuredAiReviewSchema.parse(sampleReview);
    expect(result.estimatedBand).toBe(6.5);
    expect(result.summary.strengths).toHaveLength(2);
    expect(result.mistakes.grammar).toHaveLength(1);
  });

  it('rejects missing required fields', () => {
    expect(() => structuredAiReviewSchema.parse({ overallScore: 5 })).toThrow();
  });
});

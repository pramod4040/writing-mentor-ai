import { describe, it, expect } from 'vitest';
import { parseAiReviewSections } from './parse-ai-review-sections';

describe('parseAiReviewSections', () => {
  it('splits numbered sections', () => {
    const text = `1. Estimated Score
Band 6.0

2. Strengths
Clear purpose

3. Areas for Improvement
Grammar`;

    const sections = parseAiReviewSections(text);
    expect(sections.length).toBe(3);
    expect(sections[0].title).toBe('Estimated Score');
    expect(sections[1].body).toContain('Clear purpose');
  });

  it('falls back to single section', () => {
    const sections = parseAiReviewSections('Plain feedback without numbers');
    expect(sections.length).toBe(1);
    expect(sections[0].title).toBe('Full review');
  });
});

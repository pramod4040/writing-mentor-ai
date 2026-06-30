import { describe, expect, it } from 'vitest';
import {
  aiReviewLimitExceededSchema,
  aiReviewQuotaResponseSchema,
} from './quota.schema.js';

describe('aiReviewQuotaResponseSchema', () => {
  it('accepts valid quota response', () => {
    const result = aiReviewQuotaResponseSchema.safeParse({
      used: 2,
      limit: 3,
      remaining: 1,
      resetsAt: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts quota with resetsAt', () => {
    const result = aiReviewQuotaResponseSchema.safeParse({
      used: 3,
      limit: 3,
      remaining: 0,
      resetsAt: '2026-06-25T14:30:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('aiReviewLimitExceededSchema', () => {
  it('accepts valid 429 error body', () => {
    const result = aiReviewLimitExceededSchema.safeParse({
      statusCode: 429,
      message: 'Daily AI review limit reached',
      used: 3,
      limit: 3,
      resetsAt: '2026-06-25T14:30:00.000Z',
    });
    expect(result.success).toBe(true);
  });
});

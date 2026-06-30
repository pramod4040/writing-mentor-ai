import { z } from 'zod';

export const DEFAULT_DAILY_AI_REVIEW_LIMIT = 3;
export const AI_REVIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export const aiReviewQuotaResponseSchema = z.object({
  used: z.number().int().min(0),
  limit: z.number().int().min(0),
  remaining: z.number().int().min(0),
  resetsAt: z.string().datetime().nullable(),
});

export type AiReviewQuotaResponse = z.infer<typeof aiReviewQuotaResponseSchema>;

export const aiReviewLimitExceededSchema = z.object({
  statusCode: z.literal(429),
  message: z.string(),
  used: z.number().int(),
  limit: z.number().int(),
  resetsAt: z.string().datetime().nullable(),
});

export type AiReviewLimitExceeded = z.infer<typeof aiReviewLimitExceededSchema>;

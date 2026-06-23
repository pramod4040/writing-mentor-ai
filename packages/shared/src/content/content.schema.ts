import { z } from 'zod';
import { aiReviewResponseSchema } from '../ai-review/ai-review.schema.js';

export const createContentSchema = z.object({
  shortName: z.string().min(1).max(200),
  question: z.string().min(1).max(2000),
  feedback: z.string().max(50000).nullable().optional(),
  textContent: z.string().min(1).max(50000),
});

export const updateContentSchema = createContentSchema.partial();

export const contentResponseSchema = z.object({
  id: z.string().min(1),
  shortName: z.string(),
  question: z.string(),
  feedback: z.string().nullable(),
  textContent: z.string(),
  userId: z.string(),
  aiReviewedTimes: z.number().int(),
  wordCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createAiReviewRequestSchema = z.object({
  mentorTypeId: z.string().min(1),
  question: z.string().min(1).max(2000).optional(),
  textContent: z.string().min(1).max(50000).optional(),
});

export const saveAndReviewSchema = z.object({
  contentId: z.string().min(1).optional(),
  question: z.string().min(1).max(2000),
  textContent: z.string().min(1).max(50000),
  mentorTypeId: z.string().min(1),
});

export const saveAndReviewResponseSchema = z.object({
  content: contentResponseSchema,
  review: aiReviewResponseSchema,
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ContentResponse = z.infer<typeof contentResponseSchema>;
export type CreateAiReviewRequest = z.infer<typeof createAiReviewRequestSchema>;
export type SaveAndReviewInput = z.infer<typeof saveAndReviewSchema>;
export type SaveAndReviewResponse = z.infer<typeof saveAndReviewResponseSchema>;

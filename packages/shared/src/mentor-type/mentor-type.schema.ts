import { z } from 'zod';

export const createMentorTypeSchema = z.object({
  name: z.string().min(1).max(100),
  systemPrompt: z.string().min(1).max(10000),
  practicePrompt: z.string().min(1).max(2000),
  description: z.string().max(500).optional(),
});

export const updateMentorTypeSchema = createMentorTypeSchema.partial();

export const mentorTypeResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  systemPrompt: z.string(),
  practicePrompt: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateMentorTypeInput = z.infer<typeof createMentorTypeSchema>;
export type UpdateMentorTypeInput = z.infer<typeof updateMentorTypeSchema>;
export type MentorTypeResponse = z.infer<typeof mentorTypeResponseSchema>;

import { z } from 'zod';

export const createExampleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

export const updateExampleSchema = createExampleSchema.partial();

export const exampleResponseSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ExampleResponse = z.infer<typeof exampleResponseSchema>;

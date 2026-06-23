import { z } from 'zod';

export const statsResponseSchema = z.object({
  contentCount: z.number().int(),
  aiReviewCount: z.number().int(),
});

export type StatsResponse = z.infer<typeof statsResponseSchema>;

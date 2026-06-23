import { z } from 'zod';

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  errors: z.array(z.object({
    field: z.string().optional(),
    message: z.string(),
  })).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

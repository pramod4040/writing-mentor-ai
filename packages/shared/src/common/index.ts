import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
    totalPages: z.number().int(),
  });

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.string(),
  errors: z.array(z.object({ field: z.string().optional(), message: z.string() })).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export { countWords } from './count-words.js';
export { generateShortName } from './generate-short-name.js';

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

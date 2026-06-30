import { aiReviewLimitExceededSchema } from '@writer-mentor-ai/shared/ai-review';
import { ApiClientError } from '@/lib/api/client';

export function formatAiReviewLimitError(error: unknown): string | null {
  if (!(error instanceof ApiClientError) || error.statusCode !== 429) {
    return null;
  }

  const parsed = aiReviewLimitExceededSchema.safeParse(error.data);
  if (!parsed.success) {
    return error.message;
  }

  const { limit, resetsAt } = parsed.data;
  if (resetsAt) {
    const time = new Date(resetsAt).toLocaleString();
    return `You've used all ${limit} AI reviews for today. Next review available at ${time}.`;
  }

  return `You've used all ${limit} AI reviews for today.`;
}

export function formatQuotaResetsAt(resetsAt: string | null): string | null {
  if (!resetsAt) return null;
  return new Date(resetsAt).toLocaleString();
}

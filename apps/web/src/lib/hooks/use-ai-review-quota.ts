'use client';

import { useQuery } from '@tanstack/react-query';
import type { AiReviewQuotaResponse } from '@writer-mentor-ai/shared/ai-review';
import { apiFetch } from '@/lib/api/client';

export const AI_REVIEW_QUOTA_KEY = ['ai-review-quota'] as const;

export function useAiReviewQuota() {
  return useQuery({
    queryKey: AI_REVIEW_QUOTA_KEY,
    queryFn: () => apiFetch<AiReviewQuotaResponse>('/contents/ai-review-quota'),
  });
}

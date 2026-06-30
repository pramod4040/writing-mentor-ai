'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import type { SaveAndReviewInput, SaveAndReviewResponse } from '@writer-mentor-ai/shared/content';
import { AI_REVIEW_QUOTA_KEY } from '@/lib/hooks/use-ai-review-quota';

const KEYS = {
  all: ['ai-reviews'] as const,
  byContent: (contentId: string) => [...KEYS.all, 'content', contentId] as const,
};

type CreateAiReviewInput = {
  mentorTypeId: string;
  question?: string;
  textContent?: string;
};

export function useAiReviews(contentId: string) {
  return useQuery({
    queryKey: KEYS.byContent(contentId),
    queryFn: () => apiFetch<AiReviewResponse[]>(`/contents/${contentId}/ai-reviews`),
    enabled: !!contentId,
  });
}

export function useCreateAiReview(contentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAiReviewInput | string) => {
      const body =
        typeof input === 'string' ? { mentorTypeId: input } : input;
      return apiFetch<AiReviewResponse>(`/contents/${contentId}/ai-review`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.byContent(contentId) });
      qc.invalidateQueries({ queryKey: ['contents'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: AI_REVIEW_QUOTA_KEY });
    },
  });
}

export function useSaveAndReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAndReviewInput) =>
      apiFetch<SaveAndReviewResponse>('/contents/save-and-review', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KEYS.byContent(data.content.id) });
      qc.invalidateQueries({ queryKey: ['contents'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: AI_REVIEW_QUOTA_KEY });
    },
  });
}

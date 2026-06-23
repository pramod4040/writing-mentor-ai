'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type {
  GeneratePracticeQuestionsResponse,
  PracticeQuestionCountResponse,
  PracticeQuestionResponse,
  SubmitPracticeAnswerResponse,
} from '@writer-mentor-ai/shared/practice-question';
import { difficultyFromBand } from '@writer-mentor-ai/shared/practice-question';

const KEYS = {
  all: ['practice-questions'] as const,
  byReview: (reviewId: string) => [...KEYS.all, 'review', reviewId] as const,
  count: (reviewId: string) => [...KEYS.all, 'count', reviewId] as const,
};

export function usePracticeQuestions(reviewId: string) {
  return useQuery({
    queryKey: KEYS.byReview(reviewId),
    queryFn: () =>
      apiFetch<PracticeQuestionResponse[]>(`/ai-reviews/${reviewId}/practice-questions`),
    enabled: !!reviewId,
  });
}

export function usePracticeQuestionCount(reviewId: string) {
  return useQuery({
    queryKey: KEYS.count(reviewId),
    queryFn: () =>
      apiFetch<PracticeQuestionCountResponse>(
        `/ai-reviews/${reviewId}/practice-questions/count`,
      ),
    enabled: !!reviewId,
  });
}

export function useGeneratePracticeQuestions(reviewId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<GeneratePracticeQuestionsResponse>(
        `/ai-reviews/${reviewId}/practice-questions/generate`,
        { method: 'POST' },
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.byReview(reviewId) });
      qc.invalidateQueries({ queryKey: KEYS.count(reviewId) });
    },
  });
}

export function useSubmitPracticeAnswer(questionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answer: string) =>
      apiFetch<SubmitPracticeAnswerResponse>(`/practice-questions/${questionId}/submit`, {
        method: 'PATCH',
        body: JSON.stringify({ answer }),
      }),
    onSuccess: (_data, _answer, _ctx) => {
      qc.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function getDifficultyLabel(band: number | null): string {
  const difficulty = difficultyFromBand(band);
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}

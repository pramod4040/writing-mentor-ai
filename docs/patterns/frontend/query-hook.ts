// Pattern: TanStack Query hook — copy to use-<feature>.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { ExampleResponse, CreateExampleInput } from '@writer-mentor-ai/shared/_example';

const KEYS = { all: ['feature'] as const };

export function useFeatureList() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => apiFetch<ExampleResponse[]>('/feature'),
  });
}

export function useCreateFeature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExampleInput) =>
      apiFetch<ExampleResponse>('/feature', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

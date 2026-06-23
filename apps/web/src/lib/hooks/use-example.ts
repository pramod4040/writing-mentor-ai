'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type {
  CreateExampleInput,
  UpdateExampleInput,
  ExampleResponse,
} from '@writer-mentor-ai/shared/_example';
import type { PaginationQuery } from '@writer-mentor-ai/shared/common';

const KEYS = {
  all: ['examples'] as const,
  list: (query: PaginationQuery) => [...KEYS.all, 'list', query] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useExamples(query: PaginationQuery = { page: 1, limit: 20 }) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () =>
      apiFetch<{ data: ExampleResponse[]; total: number }>(
        `/examples?page=${query.page}&limit=${query.limit}`,
      ),
  });
}

export function useExample(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => apiFetch<ExampleResponse>(`/examples/${id}`),
    enabled: !!id,
  });
}

export function useCreateExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExampleInput) =>
      apiFetch<ExampleResponse>('/examples', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateExample(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateExampleInput) =>
      apiFetch<ExampleResponse>(`/examples/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteExample() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/examples/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

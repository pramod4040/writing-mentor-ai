'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type {
  CreateContentInput,
  UpdateContentInput,
  ContentResponse,
} from '@writer-mentor-ai/shared/content';
import type { PaginationQuery } from '@writer-mentor-ai/shared/common';

const KEYS = {
  all: ['contents'] as const,
  list: (query: PaginationQuery) => [...KEYS.all, 'list', query] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useContents(query: PaginationQuery = { page: 1, limit: 50 }) {
  return useQuery({
    queryKey: KEYS.list(query),
    queryFn: () =>
      apiFetch<{ data: ContentResponse[]; total: number }>(
        `/contents?page=${query.page}&limit=${query.limit}`,
      ),
  });
}

export function useContent(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => apiFetch<ContentResponse>(`/contents/${id}`),
    enabled: !!id,
  });
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentInput) =>
      apiFetch<ContentResponse>('/contents', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateContent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateContentInput) =>
      apiFetch<ContentResponse>(`/contents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/contents/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

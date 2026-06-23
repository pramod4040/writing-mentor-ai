'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type {
  CreateMentorTypeInput,
  UpdateMentorTypeInput,
  MentorTypeResponse,
} from '@writer-mentor-ai/shared/mentor-type';

const KEYS = {
  all: ['mentor-types'] as const,
  list: () => [...KEYS.all, 'list'] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useMentorTypes() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: () => apiFetch<MentorTypeResponse[]>('/mentor-types'),
  });
}

export function useMentorType(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => apiFetch<MentorTypeResponse>(`/mentor-types/${id}`),
    enabled: !!id,
  });
}

export function useCreateMentorType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMentorTypeInput) =>
      apiFetch<MentorTypeResponse>('/mentor-types', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateMentorType(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMentorTypeInput) =>
      apiFetch<MentorTypeResponse>(`/mentor-types/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      qc.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

export function useDeleteMentorType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/mentor-types/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

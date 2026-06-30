import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminUpdateUserInput,
  UserListResponse,
  UserResponse,
} from '@writer-mentor-ai/shared/auth';
import { apiFetch } from '@/lib/api/client';

export function useUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: () =>
      apiFetch<UserListResponse>(`/users?page=${page}&limit=${limit}`),
  });
}

export function useUpdateUserLimit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...input }: AdminUpdateUserInput & { userId: string }) =>
      apiFetch<UserResponse>(`/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

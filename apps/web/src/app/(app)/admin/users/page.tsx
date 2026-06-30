'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/auth/user-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateUserLimit, useUsers } from '@/lib/hooks/use-users';
import { ApiClientError } from '@/lib/api/client';

function UserLimitEditor({
  userId,
  initialLimit,
}: {
  userId: string;
  initialLimit: number;
}) {
  const [limit, setLimit] = useState(String(initialLimit));
  const [error, setError] = useState<string | null>(null);
  const updateLimit = useUpdateUserLimit();

  const handleSave = async () => {
    setError(null);
    const parsed = Number.parseInt(limit, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1000) {
      setError('Enter a number between 0 and 1000');
      return;
    }

    try {
      await updateLimit.mutateAsync({ userId, dailyAiReviewLimit: parsed });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update limit');
    }
  };

  const unchanged = Number.parseInt(limit, 10) === initialLimit;

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={1000}
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        className="h-8 w-20"
        aria-label="Daily AI review limit"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleSave}
        disabled={updateLimit.isPending || unchanged}
      >
        {updateLimit.isPending ? 'Saving…' : 'Save'}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export default function AdminUsersPage() {
  const { data, isLoading, error } = useUsers();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-[var(--muted)]">
          Manage users and configure daily AI review limits.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User list</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-[var(--muted)]">Loading users...</p>}
          {error && (
            <p className="text-sm text-red-600">
              {error instanceof Error ? error.message : 'Failed to load users'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted)]">
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 pr-4 font-medium">Password</th>
                    <th className="pb-3 font-medium">Daily limit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((user) => (
                    <tr key={user.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} image={user.image} size="sm" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-[var(--muted)]">{user.email}</td>
                      <td className="py-3 pr-4 capitalize">{user.role}</td>
                      <td className="py-3 pr-4">{user.hasPassword ? 'Set' : 'Google only'}</td>
                      <td className="py-3">
                        <UserLimitEditor
                          userId={user.id}
                          initialLimit={user.dailyAiReviewLimit}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.data.length === 0 && (
                <p className="py-4 text-sm text-[var(--muted)]">No users found.</p>
              )}
              {data.totalPages > 1 && (
                <p className="mt-4 text-sm text-[var(--muted)]">
                  Page {data.page} of {data.totalPages} ({data.total} users)
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

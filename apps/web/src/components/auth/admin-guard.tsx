'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useAuth } from '@/lib/hooks/use-auth';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== 'admin') {
      router.replace('/' as Route);
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--muted)]">
        Loading...
      </div>
    );
  }

  if (user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}

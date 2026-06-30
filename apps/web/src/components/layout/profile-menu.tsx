'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { UserAvatar } from '@/components/auth/user-avatar';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
      >
        <UserAvatar name={user.name} image={user.image} size="sm" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg"
        >
          <p className="text-base font-medium">{user.name}</p>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
          <div className="mt-4 space-y-2">
            <Link
              href={'/settings' as Route}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--background)]"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-[var(--background)]"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ThemeToggle } from './profile-menu-theme';

'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon, Sun, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useUiStore } from '@/lib/stores/ui-store';
import { useMentorTypes } from '@/lib/hooks/use-mentor-types';

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const defaultMentorTypeId = useUiStore((s) => s.defaultMentorTypeId);
  const setDefaultMentorTypeId = useUiStore((s) => s.setDefaultMentorTypeId);
  const { data: mentorTypes } = useMentorTypes();

  useEffect(() => {
    if (!mentorTypes?.length) return;
    if (!defaultMentorTypeId) {
      const ielts = mentorTypes.find((t) => t.name === 'IELTS');
      setDefaultMentorTypeId(ielts?.id ?? mentorTypes[0].id);
    }
  }, [mentorTypes, defaultMentorTypeId, setDefaultMentorTypeId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 rounded-full p-0"
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
      >
        <User className="h-4 w-4" />
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg"
        >
          <p className="text-base font-medium">Demo User</p>
          <p className="text-sm text-[var(--muted)]">demo-user</p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="default-mentor">Default review type</Label>
            <Select
              id="default-mentor"
              value={defaultMentorTypeId ?? ''}
              onChange={(e) => setDefaultMentorTypeId(e.target.value)}
            >
              {mentorTypes?.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
            <p className="text-sm text-[var(--muted)]">
              Used for all AI reviews until you change it here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function ThemeToggle() {
  const theme = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-9 w-9 p-0"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

'use client';

import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUiStore } from '@/lib/stores/ui-store';
import { ThemeToggle, ProfileMenu } from './profile-menu';

export function TopNav() {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4"
    >
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <span className="text-base font-semibold tracking-tight">Writing Mentor</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}

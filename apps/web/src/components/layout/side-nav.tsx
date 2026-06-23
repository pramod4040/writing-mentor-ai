'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenLine, Settings2, FlaskConical, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/stores/ui-store';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/write', label: 'Write', icon: PenLine },
  { href: '/ai-review', label: 'AI Reviews', icon: Sparkles },
  { href: '/admin/mentor-types', label: 'Mentor Types', icon: Settings2 },
  { href: '/examples', label: 'Examples', icon: FlaskConical },
] as const;

export function SideNav() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        'flex shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)] transition-all duration-200',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === '/ai-review' && pathname.startsWith('/ai-review'));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-base transition-colors',
                active
                  ? 'bg-[var(--accent-soft)] text-[var(--foreground)] font-medium'
                  : 'text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--foreground)]',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

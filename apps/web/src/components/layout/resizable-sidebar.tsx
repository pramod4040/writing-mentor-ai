'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH_RATIO,
  MIN_SIDEBAR_WIDTH,
} from '@/lib/stores/ui-store';

type ResizableSidebarProps = {
  children: React.ReactNode;
  main: React.ReactNode;
  width: number;
  onWidthChange: (width: number) => void;
  className?: string;
  sidebarClassName?: string;
};

function clampWidth(width: number, containerWidth: number) {
  const maxWidth = Math.max(MIN_SIDEBAR_WIDTH, containerWidth * MAX_SIDEBAR_WIDTH_RATIO);
  return Math.min(maxWidth, Math.max(MIN_SIDEBAR_WIDTH, width));
}

export function ResizableSidebar({
  children,
  main,
  width,
  onWidthChange,
  className,
  sidebarClassName,
}: ResizableSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      setIsDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        const containerRect = container.getBoundingClientRect();
        const newWidth = containerRect.right - moveEvent.clientX;
        onWidthChange(clampWidth(newWidth, containerRect.width));
      };

      const onPointerUp = () => {
        setIsDragging(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    },
    [onWidthChange],
  );

  const sidebarWidth = width || DEFAULT_SIDEBAR_WIDTH;

  return (
    <div
      ref={containerRef}
      className={cn('flex h-full min-h-0 w-full', className, isDragging && 'select-none')}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{main}</div>

      <aside
        className={cn(
          'relative flex min-h-0 shrink-0 flex-col border-t border-[var(--border)] bg-[var(--accent-soft)]/30 lg:border-l lg:border-t-0',
          sidebarClassName,
        )}
        style={{ width: sidebarWidth }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className={cn(
            'absolute -left-1 top-0 z-10 hidden h-full w-2 cursor-col-resize touch-none lg:block',
            isDragging && 'bg-[var(--accent)]/20',
          )}
          onPointerDown={handlePointerDown}
        />
        {children}
      </aside>
    </div>
  );
}

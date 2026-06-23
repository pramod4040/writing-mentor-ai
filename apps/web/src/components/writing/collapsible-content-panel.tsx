'use client';

import { useCallback, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_CONTENT_PANEL_HEIGHT,
  MIN_CONTENT_PANEL_HEIGHT,
  useUiStore,
} from '@/lib/stores/ui-store';

type CollapsibleContentPanelProps = {
  question: string;
  textContent: string;
  scrollParentRef?: React.RefObject<HTMLElement | null>;
};

function getMaxPanelHeight(scrollParent: HTMLElement | null): number {
  const viewportCap = window.innerHeight * 0.5;
  if (!scrollParent) return viewportCap;
  const parentCap = scrollParent.clientHeight - 48;
  return Math.max(MIN_CONTENT_PANEL_HEIGHT, Math.min(viewportCap, parentCap));
}

function clampHeight(height: number, maxHeight: number) {
  return Math.min(maxHeight, Math.max(MIN_CONTENT_PANEL_HEIGHT, height));
}

export function CollapsibleContentPanel({
  question,
  textContent,
  scrollParentRef,
}: CollapsibleContentPanelProps) {
  const contentPanelHeight = useUiStore((s) => s.contentPanelHeight);
  const setContentPanelHeight = useUiStore((s) => s.setContentPanelHeight);

  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (collapsed) return;
      const handle = handleRef.current;
      if (!handle) return;

      event.preventDefault();
      handle.setPointerCapture(event.pointerId);

      setIsDragging(true);
      const startY = event.clientY;
      const startHeight = contentPanelHeight || DEFAULT_CONTENT_PANEL_HEIGHT;
      const scrollParent = scrollParentRef?.current ?? null;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const maxHeight = getMaxPanelHeight(scrollParent);
        const delta = moveEvent.clientY - startY;
        setContentPanelHeight(clampHeight(startHeight + delta, maxHeight));
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        setIsDragging(false);
        handle.releasePointerCapture(upEvent.pointerId);
        handle.removeEventListener('pointermove', onPointerMove);
        handle.removeEventListener('pointerup', onPointerUp);
      };

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
    },
    [collapsed, contentPanelHeight, scrollParentRef, setContentPanelHeight],
  );

  const panelHeight = collapsed ? 'auto' : contentPanelHeight || DEFAULT_CONTENT_PANEL_HEIGHT;

  return (
    <div
      className={cn(
        'relative shrink-0 rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/30',
        isDragging && 'select-none',
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <span className="text-sm font-medium text-[var(--foreground)]">Your writing</span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1.5 text-[var(--muted)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
          aria-label={collapsed ? 'Expand content' : 'Collapse content'}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div
          className="overflow-y-auto px-4 py-3"
          style={{ height: panelHeight }}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Prompt
          </p>
          <p className="mt-1 text-base leading-relaxed text-[var(--foreground)]">{question}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Writing
          </p>
          <p className="mt-1 whitespace-pre-wrap text-base leading-relaxed text-[var(--foreground)]">
            {textContent}
          </p>
        </div>
      )}

      {!collapsed && (
        <div
          ref={handleRef}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize content panel"
          className={cn(
            'group flex h-4 cursor-row-resize touch-none items-center justify-center border-t border-[var(--border)] hover:bg-[var(--accent-soft)]',
            isDragging && 'bg-[var(--accent)]/20',
          )}
          onPointerDown={handlePointerDown}
        >
          <span className="h-1 w-10 rounded-full bg-[var(--border)] group-hover:bg-[var(--accent)]/50" />
        </div>
      )}
    </div>
  );
}

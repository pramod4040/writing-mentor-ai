'use client';

import type { ContentResponse } from '@writer-mentor-ai/shared/content';
import { cn } from '@/lib/utils';
import { useContents } from '@/lib/hooks/use-contents';

type SavedContentPanelProps = {
  selectedId?: string | null;
  onSelect: (content: ContentResponse) => void;
};

export function SavedContentPanel({ selectedId, onSelect }: SavedContentPanelProps) {
  const { data, isLoading, error } = useContents();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold">Saved content</h2>
        <p className="text-sm text-[var(--muted)]">Your drafts and saved writing</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <p className="text-sm text-[var(--muted)]">Loading saved content…</p>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to load content.</p>
        ) : !data?.data.length ? (
          <p className="text-sm text-[var(--muted)]">No saved content yet. Save your writing to see it here.</p>
        ) : (
          <ul className="space-y-2">
            {data.data.map((content) => {
              const selected = content.id === selectedId;
              return (
                <li key={content.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(content)}
                    className={cn(
                      'w-full rounded-lg border px-3 py-3 text-left transition-colors',
                      selected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent-soft)]/50',
                    )}
                  >
                    <p className="truncate text-sm font-medium">{content.shortName}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {content.question}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {content.wordCount} words · {content.aiReviewedTimes} reviews
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

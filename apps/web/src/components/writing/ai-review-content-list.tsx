'use client';

import Link from 'next/link';
import { useContents } from '@/lib/hooks/use-contents';

export function AiReviewContentList() {
  const { data, isLoading, error } = useContents();

  if (isLoading) {
    return <p className="text-[var(--muted)]">Loading content…</p>;
  }

  if (error) {
    return <p className="text-red-600">Failed to load content.</p>;
  }

  if (!data?.data.length) {
    return (
      <p className="text-[var(--muted)]">
        No content yet.{' '}
        <Link href="/write" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Start writing
        </Link>
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {data.data.map((content) => (
        <li key={content.id}>
          <Link
            href={`/ai-review/${content.id}`}
            className="block rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-4 transition-colors hover:bg-[var(--accent-soft)]/50"
          >
            <p className="font-medium">{content.shortName}</p>
            <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{content.question}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {content.wordCount} words · {content.aiReviewedTimes} review
              {content.aiReviewedTimes === 1 ? '' : 's'}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

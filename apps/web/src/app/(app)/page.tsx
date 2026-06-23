'use client';

import Link from 'next/link';
import { PenLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContents } from '@/lib/hooks/use-contents';
import { useStats } from '@/lib/hooks/use-stats';

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: contents, isLoading: contentsLoading } = useContents({ page: 1, limit: 10 });

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">writer-mentor-ai</h1>
          <p className="mt-2 text-[var(--muted)]">
            Practice writing with structured AI feedback for IELTS, PTE, and professional contexts.
          </p>
        </div>
        <Link
          href="/write"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--accent)] px-8 text-base font-medium text-[var(--background)] hover:opacity-90"
        >
          <PenLine className="h-4 w-4" />
          Start Writing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-[var(--muted)]">
              Content written
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsLoading ? '—' : stats?.contentCount ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-[var(--muted)]">
              AI reviews generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsLoading ? '—' : stats?.aiReviewCount ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Recent content</h2>
          <Link
            href="/write"
            className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium hover:bg-[var(--accent-soft)]"
          >
            Write new
          </Link>
        </div>

        {contentsLoading ? (
          <p className="mt-4 text-[var(--muted)]">Loading content…</p>
        ) : !contents?.data.length ? (
          <p className="mt-4 text-[var(--muted)]">
            No content yet.{' '}
            <Link href="/write" className="text-[var(--accent)] underline-offset-2 hover:underline">
              Start your first piece
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {contents.data.map((content) => (
              <li
                key={content.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{content.shortName}</p>
                    <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">
                      {content.question}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {content.wordCount} words · {content.aiReviewedTimes} reviews
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/write?contentId=${content.id}`}
                      className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm font-medium hover:bg-[var(--accent-soft)]"
                    >
                      Edit
                    </Link>
                    {content.aiReviewedTimes > 0 && (
                      <Link
                        href={`/ai-review/${content.id}`}
                        className="inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--background)] hover:opacity-90"
                      >
                        View review
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

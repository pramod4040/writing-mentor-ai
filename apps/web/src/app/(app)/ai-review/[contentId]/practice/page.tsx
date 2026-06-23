'use client';

import { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PracticeSessionCard } from '@/components/practice/practice-session-card';
import { usePracticeQuestions } from '@/lib/hooks/use-practice-questions';
import { Button } from '@/components/ui/button';

function PracticeSessionContent({ contentId }: { contentId: string }) {
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewId') ?? '';
  const { data: questions = [], isLoading, error, refetch } = usePracticeQuestions(reviewId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!reviewId) {
    return (
      <p className="p-6 text-[var(--muted)]">
        Missing review.{' '}
        <Link href={`/ai-review/${contentId}`} className="text-[var(--accent)] underline">
          Back to review
        </Link>
      </p>
    );
  }

  if (isLoading) return <p className="p-6 text-[var(--muted)]">Loading practice questions…</p>;
  if (error) return <p className="p-6 text-red-600">Failed to load practice questions.</p>;
  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-[var(--muted)]">No practice questions yet.</p>
        <Link
          href={`/ai-review/${contentId}?reviewId=${reviewId}`}
          className="mt-4 inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--accent-soft)]"
        >
          Generate a practice set
        </Link>
      </div>
    );
  }

  if (finished || currentIndex >= questions.length) {
    const solved = questions.filter((q) => q.isSolved).length;
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        <h1 className="text-2xl font-bold">Practice complete</h1>
        <p className="text-[var(--muted)]">
          You solved {solved} of {questions.length} questions.
        </p>
        <div className="flex gap-2">
          <Link
            href={`/ai-review/${contentId}?reviewId=${reviewId}`}
            className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-sm hover:bg-[var(--accent-soft)]"
          >
            Back to review
          </Link>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setFinished(false);
              refetch();
            }}
          >
            Practice again
          </Button>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link
        href={`/ai-review/${contentId}?reviewId=${reviewId}`}
        className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
      >
        ← Back to review
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Practice session</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {current.difficultyLevel} level · {questions.length} questions
      </p>
      <div className="mt-6">
        <PracticeSessionCard
          key={current.id}
          question={current}
          index={currentIndex}
          total={questions.length}
          onNext={() => {
            if (currentIndex + 1 >= questions.length) {
              setFinished(true);
              refetch();
            } else {
              setCurrentIndex((i) => i + 1);
            }
          }}
        />
      </div>
    </div>
  );
}

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = use(params);

  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading practice session…</p>}>
        <PracticeSessionContent contentId={contentId} />
      </Suspense>
    </div>
  );
}

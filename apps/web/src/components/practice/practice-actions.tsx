'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import { Button } from '@/components/ui/button';
import {
  useGeneratePracticeQuestions,
  usePracticeQuestionCount,
  getDifficultyLabel,
} from '@/lib/hooks/use-practice-questions';

type PracticeActionsProps = {
  contentId: string;
  review: AiReviewResponse;
};

export function PracticeActions({ contentId, review }: PracticeActionsProps) {
  const { data: countData } = usePracticeQuestionCount(review.id);
  const generate = useGeneratePracticeQuestions(review.id);
  const difficultyLabel = getDifficultyLabel(review.estimatedBand);
  const count = countData?.count ?? 0;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--accent-soft)]/40 p-4">
      <h3 className="text-base font-semibold">Practice set</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {difficultyLabel} level — based on Band {review.estimatedBand ?? '—'}
      </p>
      {generate.isSuccess && (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400">
          Generated {generate.data?.questions.length ?? 0} questions.
        </p>
      )}
      {generate.isError && (
        <p className="mt-2 text-sm text-red-600">
          {generate.error instanceof Error ? generate.error.message : 'Generation failed'}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
        >
          {generate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Practice Set
        </Button>
        {count > 0 && (
          <Link
            href={`/ai-review/${contentId}/practice?reviewId=${review.id}`}
            className="inline-flex h-9 items-center rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-[var(--background)] hover:opacity-90"
          >
            Start Practice ({count})
          </Link>
        )}
      </div>
    </div>
  );
}

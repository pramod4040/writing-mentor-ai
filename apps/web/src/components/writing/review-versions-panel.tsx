'use client';

import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ReviewVersionsPanelProps = {
  reviews: AiReviewResponse[];
  selectedReviewId: string | null;
  onSelectReview: (reviewId: string) => void;
  onReviewAgain?: () => void;
  isReviewing?: boolean;
};

export function ReviewVersionsPanel({
  reviews,
  selectedReviewId,
  onSelectReview,
  onReviewAgain,
  isReviewing,
}: ReviewVersionsPanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <h2 className="text-base font-semibold">Review versions</h2>
        <p className="text-sm text-[var(--muted)]">
          {reviews.length} version{reviews.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {reviews.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No reviews yet for this content.</p>
        ) : (
          reviews.map((review, index) => {
            const selected = review.id === selectedReviewId;
            return (
              <button
                key={review.id}
                type="button"
                onClick={() => onSelectReview(review.id)}
                className={cn(
                  'w-full rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                  selected
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]'
                    : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent-soft)]/50',
                )}
              >
                <span className="font-medium">Version {reviews.length - index}</span>
                <span className="mt-1 block text-[var(--muted)]">
                  {review.mentorTypeName ?? 'Review'}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">
                  {new Date(review.createdAt).toLocaleString()}
                </span>
              </button>
            );
          })
        )}
      </div>

      {onReviewAgain && (
        <div className="border-t border-[var(--border)] p-4">
          <Button className="w-full" onClick={onReviewAgain} disabled={isReviewing}>
            {isReviewing ? 'Reviewing…' : 'Generate new review'}
          </Button>
        </div>
      )}
    </div>
  );
}

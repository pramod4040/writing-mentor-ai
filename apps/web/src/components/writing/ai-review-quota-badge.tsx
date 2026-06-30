'use client';

import type { AiReviewQuotaResponse } from '@writer-mentor-ai/shared/ai-review';
import { formatQuotaResetsAt } from '@/lib/ai-review/quota-message';
import { cn } from '@/lib/utils';

type AiReviewQuotaBadgeProps = {
  quota?: AiReviewQuotaResponse | null;
  isLoading?: boolean;
  className?: string;
};

export function AiReviewQuotaBadge({
  quota,
  isLoading,
  className,
}: AiReviewQuotaBadgeProps) {
  if (isLoading) {
    return (
      <span className={cn('text-sm text-[var(--muted)]', className)}>
        Loading quota…
      </span>
    );
  }

  if (!quota) return null;

  const atLimit = quota.remaining === 0;
  const resetsLabel = formatQuotaResetsAt(quota.resetsAt);

  return (
    <span
      className={cn(
        'rounded-full px-3 py-1 text-sm',
        atLimit
          ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300'
          : 'bg-[var(--accent-soft)] text-[var(--muted)]',
        className,
      )}
      title={
        atLimit && resetsLabel
          ? `Next review available at ${resetsLabel}`
          : undefined
      }
    >
      {atLimit
        ? `Daily limit reached${resetsLabel ? ` · resets ${resetsLabel}` : ''}`
        : `${quota.remaining} of ${quota.limit} reviews remaining today`}
    </span>
  );
}

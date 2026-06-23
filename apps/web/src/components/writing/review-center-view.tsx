'use client';

import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import type { ContentResponse } from '@writer-mentor-ai/shared/content';
import { useRef } from 'react';
import { CollapsibleContentPanel } from './collapsible-content-panel';
import { StructuredReviewView } from './structured-review-view';
import { PracticeActions } from '@/components/practice/practice-actions';

type ReviewCenterViewProps = {
  review: AiReviewResponse;
  content: Pick<ContentResponse, 'id' | 'shortName' | 'question' | 'textContent'>;
};

export function ReviewCenterView({ review, content }: ReviewCenterViewProps) {
  const writingText = review.textContent || content.textContent;
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasBand = review.estimatedBand !== null;

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">AI Review</h2>
            <p className="mt-1 text-sm text-[var(--muted)] line-clamp-2">{content.shortName}</p>
          </div>
          {hasBand && (
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-2xl font-bold leading-none">Band {review.estimatedBand}</span>
              {review.overallScore !== null && (
                <span className="text-sm text-[var(--muted)]">
                  Overall {review.overallScore}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {review.mentorTypeName ?? 'Review'} — {new Date(review.createdAt).toLocaleString()}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-5"
      >
        <CollapsibleContentPanel
          question={content.question}
          textContent={writingText}
          scrollParentRef={scrollRef}
        />
        <PracticeActions contentId={content.id} review={review} />
        <StructuredReviewView review={review} />
      </div>
    </div>
  );
}

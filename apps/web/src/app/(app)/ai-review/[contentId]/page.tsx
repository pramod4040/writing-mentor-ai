'use client';

import { Suspense, useCallback, useEffect, useMemo, useState, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResizableSidebar } from '@/components/layout/resizable-sidebar';
import { ReviewCenterView } from '@/components/writing/review-center-view';
import { ReviewVersionsPanel } from '@/components/writing/review-versions-panel';
import { useContent } from '@/lib/hooks/use-contents';
import { useAiReviews, useCreateAiReview } from '@/lib/hooks/use-ai-reviews';
import { useAiReviewQuota } from '@/lib/hooks/use-ai-review-quota';
import { formatAiReviewLimitError } from '@/lib/ai-review/quota-message';
import { AiReviewQuotaBadge } from '@/components/writing/ai-review-quota-badge';
import { useUiStore } from '@/lib/stores/ui-store';

type AiReviewDetailProps = {
  contentId: string;
};

function AiReviewDetailContent({ contentId }: AiReviewDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewIdParam = searchParams.get('reviewId');

  const aiReviewSidebarWidth = useUiStore((s) => s.aiReviewSidebarWidth);
  const setAiReviewSidebarWidth = useUiStore((s) => s.setAiReviewSidebarWidth);
  const defaultMentorTypeId = useUiStore((s) => s.defaultMentorTypeId);

  const { data: content, isLoading: contentLoading } = useContent(contentId);
  const { data: reviews = [], isLoading: reviewsLoading, refetch } = useAiReviews(contentId);
  const createReview = useCreateAiReview(contentId);
  const { data: quota, isLoading: quotaLoading } = useAiReviewQuota();

  const atReviewLimit = quota?.remaining === 0;

  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const selectedReview = useMemo(
    () => reviews.find((r) => r.id === selectedReviewId) ?? reviews[0] ?? null,
    [reviews, selectedReviewId],
  );

  const updateReviewId = useCallback(
    (reviewId: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set('reviewId', reviewId);
      router.replace(`/ai-review/${contentId}?${next.toString()}`);
    },
    [router, searchParams, contentId],
  );

  useEffect(() => {
    if (reviewIdParam) {
      setSelectedReviewId(reviewIdParam);
    } else if (reviews[0]) {
      setSelectedReviewId(reviews[0].id);
    }
  }, [reviewIdParam, reviews]);

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    updateReviewId(reviewId);
  };

  const handleReviewAgain = async () => {
    if (!defaultMentorTypeId) {
      setReviewError('Set a default review type in your profile menu.');
      return;
    }
    setReviewError(null);
    try {
      const review = await createReview.mutateAsync(defaultMentorTypeId);
      setSelectedReviewId(review.id);
      updateReviewId(review.id);
      refetch();
    } catch (e) {
      setReviewError(
        formatAiReviewLimitError(e) ??
          (e instanceof Error ? e.message : 'Failed to generate AI review'),
      );
    }
  };

  if (contentLoading || reviewsLoading) {
    return <p className="p-6 text-[var(--muted)]">Loading review…</p>;
  }

  if (!content) {
    return (
      <p className="p-6 text-[var(--muted)]">
        Content not found.{' '}
        <Link href="/ai-review" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Back to list
        </Link>
      </p>
    );
  }

  const centerContent = selectedReview ? (
    <ReviewCenterView review={selectedReview} content={content} />
  ) : (
    <div className="flex flex-col gap-4 p-6">
      <p className="text-[var(--muted)]">No reviews for this content yet.</p>
      <Link
        href={`/write?contentId=${content.id}`}
        className="text-[var(--accent)] underline-offset-2 hover:underline"
      >
        Edit and request a review
      </Link>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--border)] px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/ai-review"
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ← All content
        </Link>
        <AiReviewQuotaBadge quota={quota} isLoading={quotaLoading} />
      </div>

      <ResizableSidebar
        width={aiReviewSidebarWidth}
        onWidthChange={setAiReviewSidebarWidth}
        className="flex-1 min-h-0"
        main={
          <section className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
            {reviewError && (
              <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {reviewError}
              </p>
            )}
            {centerContent}
          </section>
        }
      >
        <ReviewVersionsPanel
          reviews={reviews}
          selectedReviewId={selectedReviewId}
          onSelectReview={handleSelectReview}
          onReviewAgain={handleReviewAgain}
          isReviewing={createReview.isPending}
          reviewDisabled={atReviewLimit}
          reviewDisabledReason={
            atReviewLimit && quota?.resetsAt
              ? `Next review available at ${new Date(quota.resetsAt).toLocaleString()}`
              : undefined
          }
        />
      </ResizableSidebar>
    </div>
  );
}

export default function AiReviewDetailPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = use(params);

  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading review…</p>}>
        <AiReviewDetailContent contentId={contentId} />
      </Suspense>
    </div>
  );
}

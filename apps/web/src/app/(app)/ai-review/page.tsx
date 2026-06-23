import { AiReviewContentList } from '@/components/writing/ai-review-content-list';

export default function AiReviewPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight">AI Reviews</h1>
      <p className="mt-2 text-[var(--muted)]">
        Select a piece of writing to view its AI feedback.
      </p>
      <div className="mt-6">
        <AiReviewContentList />
      </div>
    </div>
  );
}

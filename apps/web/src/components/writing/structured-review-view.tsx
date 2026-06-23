'use client';

import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewSectionsAccordion } from './review-sections-accordion';

function hasStructuredReview(review: AiReviewResponse): boolean {
  return review.estimatedBand !== null && review.scores !== null;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, (value / 9) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-[var(--muted)]">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--accent-soft)]">
        <div
          className="h-2 rounded-full bg-[var(--accent)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type StructuredReviewViewProps = {
  review: AiReviewResponse;
};

export function StructuredReviewView({ review }: StructuredReviewViewProps) {
  if (!hasStructuredReview(review)) {
    return <ReviewSectionsAccordion reviews={[review]} defaultOpen />;
  }

  const scores = review.scores!;
  const summary = review.summary;
  const scoreEntries: { label: string; value: number }[] = [
    { label: 'Task response', value: scores.taskResponse },
    { label: 'Grammar', value: scores.grammar },
    { label: 'Vocabulary', value: scores.vocabulary },
    { label: 'Cohesion', value: scores.cohesion },
    { label: 'Structure', value: scores.structure },
    { label: 'Formality', value: scores.formality },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Score breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {scoreEntries.map((entry) => (
            <ScoreBar key={entry.label} label={entry.label} value={entry.value} />
          ))}
        </CardContent>
      </Card>

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-green-200/50 bg-green-50/50 dark:border-green-900/40 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-base leading-relaxed">
                {summary.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle>Weaknesses</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-base leading-relaxed">
                {summary.weaknesses.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-600 dark:text-amber-400">−</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {review.priorityImprovements && review.priorityImprovements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Priority improvements</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed">
              {review.priorityImprovements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {review.mistakes && Object.keys(review.mistakes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mistakes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(review.mistakes).map(([category, items]) => (
              <div
                key={category}
                className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/30 px-3 py-3"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  {category}
                </p>
                <ul className="mt-2 space-y-1.5 text-base leading-relaxed">
                  {items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {review.feedback && review.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-base leading-relaxed">
              {review.feedback.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[var(--muted)]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {review.learningPlan && review.learningPlan.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning plan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-base leading-relaxed">
              {review.learningPlan.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

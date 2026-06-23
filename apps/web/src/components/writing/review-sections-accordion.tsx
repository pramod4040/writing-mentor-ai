'use client';

import type { AiReviewResponse } from '@writer-mentor-ai/shared/ai-review';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { parseAiReviewSections } from '@/lib/parse-ai-review-sections';

function SectionAccordion({
  review,
  defaultOpen,
}: {
  review: AiReviewResponse;
  defaultOpen?: boolean;
}) {
  const sections = parseAiReviewSections(review.aiGeneratedReview);
  const defaultOpenIds = defaultOpen
    ? sections.map((section) => `${review.id}-${section.id}`)
    : [];

  return (
    <Accordion className="mt-2" defaultOpen={defaultOpenIds}>
      {sections.map((section) => (
        <AccordionItem key={`${review.id}-${section.id}`} id={`${review.id}-${section.id}`}>
          <AccordionTrigger id={`${review.id}-${section.id}`}>
            {section.title}
          </AccordionTrigger>
          <AccordionContent id={`${review.id}-${section.id}`}>
            <p className="whitespace-pre-wrap text-base text-[var(--foreground)]">{section.body}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

type ReviewSectionsAccordionProps = {
  reviews: AiReviewResponse[];
  defaultOpen?: boolean;
};

export function ReviewSectionsAccordion({ reviews, defaultOpen }: ReviewSectionsAccordionProps) {
  if (!reviews.length) {
    return <p className="text-sm text-[var(--muted)]">No AI reviews yet.</p>;
  }

  if (reviews.length === 1 && defaultOpen) {
    return <SectionAccordion review={reviews[0]} defaultOpen />;
  }

  return (
    <Accordion defaultOpen={defaultOpen ? reviews.map((r) => r.id) : []}>
      {reviews.map((review) => (
        <AccordionItem key={review.id} id={review.id}>
          <AccordionTrigger id={review.id}>
            {review.mentorTypeName ?? 'Review'} — {new Date(review.createdAt).toLocaleString()}
          </AccordionTrigger>
          <AccordionContent id={review.id}>
            <SectionAccordion review={review} defaultOpen={defaultOpen} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

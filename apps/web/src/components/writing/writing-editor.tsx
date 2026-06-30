'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus } from 'lucide-react';
import { countWords, generateShortName } from '@writer-mentor-ai/shared/common';
import type { ContentResponse } from '@writer-mentor-ai/shared/content';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateContent, useUpdateContent } from '@/lib/hooks/use-contents';
import { useSaveAndReview } from '@/lib/hooks/use-ai-reviews';
import { useAiReviewQuota } from '@/lib/hooks/use-ai-review-quota';
import { AiReviewQuotaBadge } from '@/components/writing/ai-review-quota-badge';
import { formatAiReviewLimitError } from '@/lib/ai-review/quota-message';
import {
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  useUiStore,
} from '@/lib/stores/ui-store';

type WritingEditorProps = {
  selectedContent?: ContentResponse | null;
  onSaved?: (content: ContentResponse) => void;
  onNew?: () => void;
};

export function WritingEditor({
  selectedContent,
  onSaved,
  onNew,
}: WritingEditorProps) {
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [textContent, setTextContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const defaultMentorTypeId = useUiStore((s) => s.defaultMentorTypeId);
  const writingFontSize = useUiStore((s) => s.writingFontSize);
  const setWritingFontSize = useUiStore((s) => s.setWritingFontSize);

  const createContent = useCreateContent();
  const updateContent = useUpdateContent(selectedContent?.id ?? 'new');
  const saveAndReview = useSaveAndReview();
  const { data: quota, isLoading: quotaLoading } = useAiReviewQuota();

  const atReviewLimit = quota?.remaining === 0;

  useEffect(() => {
    if (selectedContent) {
      setQuestion(selectedContent.question);
      setTextContent(selectedContent.textContent);
    } else {
      setQuestion('');
      setTextContent('');
    }
  }, [selectedContent]);

  const wordCount = countWords(textContent);
  const isSaving = createContent.isPending || updateContent.isPending;
  const isReviewing = saveAndReview.isPending;

  const handleSave = async () => {
    setError(null);
    try {
      const shortName = generateShortName(textContent);
      const payload = { shortName, question, textContent };
      const result = selectedContent
        ? await updateContent.mutateAsync(payload)
        : await createContent.mutateAsync(payload);
      onSaved?.(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    }
  };

  const handleAiReview = async () => {
    setError(null);
    if (!question.trim() || !textContent.trim()) {
      setError('Add a prompt and writing before requesting a review.');
      return;
    }
    if (!defaultMentorTypeId) {
      setError('Set a default review type in your profile menu.');
      return;
    }
    try {
      const result = await saveAndReview.mutateAsync({
        contentId: selectedContent?.id,
        question,
        textContent,
        mentorTypeId: defaultMentorTypeId,
      });
      onSaved?.(result.content);
      router.push(`/ai-review/${result.content.id}`);
    } catch (e) {
      setError(formatAiReviewLimitError(e) ?? (e instanceof Error ? e.message : 'Failed to generate AI review'));
    }
  };

  const writingStyle = {
    fontSize: `${writingFontSize}px`,
    lineHeight: 1.6,
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div
        className="relative flex min-h-0 flex-1 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm ring-1 ring-[var(--accent)]/10 transition-shadow duration-200 focus-within:shadow-md focus-within:ring-[var(--accent)]/25"
      >
        <div className="border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="question" className="text-sm text-[var(--muted)]">
              Writing prompt
            </Label>
            <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setWritingFontSize(writingFontSize - 2)}
                disabled={writingFontSize <= MIN_FONT_SIZE}
                aria-label="Decrease font size"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-8 text-center text-xs text-[var(--muted)]">
                {writingFontSize}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setWritingFontSize(writingFontSize + 2)}
                disabled={writingFontSize >= MAX_FONT_SIZE}
                aria-label="Increase font size"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            id="question"
            placeholder="What is the writing task or question?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={writingStyle}
            className="mt-2 min-h-[72px] border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="relative flex-1 min-h-[50vh] px-5 py-4">
          <Textarea
            id="textContent"
            placeholder="Start writing here…"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            style={writingStyle}
            className="h-full min-h-[50vh] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <div
          className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--card)]/95 px-5 py-4 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm text-[var(--muted)]">
              {wordCount} words
            </span>
            <AiReviewQuotaBadge quota={quota} isLoading={quotaLoading} />
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedContent && (
              <Button variant="outline" onClick={onNew}>
                New
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !question.trim() || !textContent.trim()}
            >
              {isSaving ? 'Saving…' : selectedContent ? 'Update' : 'Save'}
            </Button>
            <Button
              variant="outline"
              onClick={handleAiReview}
              disabled={
                isReviewing ||
                atReviewLimit ||
                !question.trim() ||
                !textContent.trim()
              }
              title={
                atReviewLimit && quota?.resetsAt
                  ? `Next review available at ${new Date(quota.resetsAt).toLocaleString()}`
                  : undefined
              }
            >
              {isReviewing ? 'Reviewing…' : 'AI Review'}
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="mt-3 text-base text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

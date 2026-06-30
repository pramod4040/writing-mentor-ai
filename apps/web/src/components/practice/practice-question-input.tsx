'use client';

import type { PracticeQuestionType } from '@writer-mentor-ai/shared/practice-question';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function getQuestionTypeLabel(type: PracticeQuestionType): string {
  const labels: Record<PracticeQuestionType, string> = {
    mcq: 'Multiple choice',
    fill_blank: 'Fill in the blank',
    true_false: 'True or false',
    sentence_correction: 'Sentence correction',
    error_detection: 'Error detection',
    matching: 'Matching',
    sentence_transformation: 'Sentence transformation',
    cloze_passage: 'Cloze passage',
    short_answer: 'Short answer',
  };
  return labels[type];
}

type QuestionInputProps = {
  questionType: PracticeQuestionType;
  question: string;
  options?: string[] | null;
  metadata?: Record<string, unknown> | null;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function highlightErrorInSentence(sentence: string, error?: string) {
  if (!error || !sentence.includes(error)) {
    return <span>{sentence}</span>;
  }
  const parts = sentence.split(error);
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <mark className="rounded bg-amber-200 px-0.5 dark:bg-amber-900/60">{error}</mark>
          )}
        </span>
      ))}
    </span>
  );
}

export function PracticeQuestionInput({
  questionType,
  question,
  options,
  metadata,
  value,
  onChange,
  disabled,
}: QuestionInputProps) {
  if (questionType === 'mcq' && options?.length) {
    return (
      <div className="space-y-2">
        <p className="text-base font-medium">{question}</p>
        <div className="grid gap-2">
          {options.map((option, index) => {
            const letter = String.fromCharCode(65 + index);
            const optionValue = option.startsWith(`${letter})`) ? letter : option;
            return (
              <Button
                key={option}
                type="button"
                variant={value === optionValue || value === letter ? 'default' : 'outline'}
                className="justify-start text-left"
                disabled={disabled}
                onClick={() => onChange(optionValue.length === 1 ? optionValue : letter)}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (questionType === 'true_false') {
    return (
      <div className="space-y-3">
        <p className="text-base font-medium">{question}</p>
        <div className="flex gap-2">
          {['true', 'false'].map((opt) => (
            <Button
              key={opt}
              type="button"
              variant={value === opt ? 'default' : 'outline'}
              disabled={disabled}
              onClick={() => onChange(opt)}
              className="capitalize"
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (questionType === 'matching' && metadata?.pairs) {
    const pairs = metadata.pairs as Array<{ left: string; right: string }>;
    const parsed = (() => {
      try {
        return JSON.parse(value || '{}') as Record<string, string>;
      } catch {
        return {} as Record<string, string>;
      }
    })();

    return (
      <div className="space-y-3">
        <p className="text-base font-medium">{question}</p>
        {pairs.map((pair) => (
          <div key={pair.left} className="grid gap-2 sm:grid-cols-2 sm:items-center">
            <span className="text-sm font-medium">{pair.left}</span>
            <select
              className="rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm"
              disabled={disabled}
              value={parsed[pair.left] ?? ''}
              onChange={(e) => {
                const next = { ...parsed, [pair.left]: e.target.value };
                onChange(JSON.stringify(next));
              }}
            >
              <option value="">Select match…</option>
              {pairs.map((p) => (
                <option key={p.right} value={p.right}>{p.right}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  if (questionType === 'cloze_passage' && metadata?.blanks) {
    const blanks = metadata.blanks as string[];
    const parsed = (() => {
      try {
        return JSON.parse(value || '[]') as string[];
      } catch {
        return blanks.map(() => '');
      }
    })();

    return (
      <div className="space-y-3">
        <p className="text-base font-medium">{question}</p>
        {blanks.map((_, index) => (
          <div key={index} className="space-y-1">
            <Label>Blank {index + 1}</Label>
            <Input
              value={parsed[index] ?? ''}
              disabled={disabled}
              onChange={(e) => {
                const next = [...parsed];
                next[index] = e.target.value;
                onChange(JSON.stringify(next));
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (questionType === 'fill_blank') {
    return (
      <div className="space-y-2">
        <p className="text-base font-medium">{question}</p>
        <Label className="text-sm text-[var(--muted)]">Your answer</Label>
        <Input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }

  if (questionType === 'sentence_correction') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">Correct this sentence:</p>
        <p className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/30 p-3 text-base">
          {question}
        </p>
        <div className="space-y-1">
          <Label>Corrected sentence</Label>
          <Input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type the corrected sentence…"
          />
        </div>
      </div>
    );
  }

  if (questionType === 'error_detection') {
    const errorText = typeof metadata?.error === 'string' ? metadata.error : undefined;
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">Find and fix the error in this sentence:</p>
        <p className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/30 p-3 text-base">
          {highlightErrorInSentence(question, errorText)}
        </p>
        <div className="space-y-1">
          <Label>Corrected sentence</Label>
          <Input
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type the corrected sentence…"
          />
        </div>
      </div>
    );
  }

  if (questionType === 'sentence_transformation') {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-[var(--muted)]">Rewrite as instructed:</p>
        <p className="rounded-lg border border-[var(--border)] bg-[var(--accent-soft)]/30 p-3 text-base">
          {question}
        </p>
        <div className="space-y-1">
          <Label>Your rewritten sentence</Label>
          <Textarea
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px]"
            placeholder="Type your rewritten sentence…"
          />
        </div>
      </div>
    );
  }

  if (questionType === 'short_answer') {
    return (
      <div className="space-y-2">
        <p className="text-base font-medium">{question}</p>
        <Label className="text-sm text-[var(--muted)]">Answer in 1–2 sentences</Label>
        <Textarea
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px]"
          placeholder="Type your answer…"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{question}</Label>
      <Textarea
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[120px]"
      />
    </div>
  );
}

export function PracticeFeedback({
  correct,
  matchPercent,
  correctAnswer,
  feedback,
  questionType,
  metadata,
}: {
  correct: boolean;
  matchPercent: number;
  correctAnswer: string;
  feedback?: string;
  questionType?: PracticeQuestionType;
  metadata?: Record<string, unknown> | null;
}) {
  const errorText = typeof metadata?.error === 'string' ? metadata.error : undefined;
  const correctionText = typeof metadata?.correction === 'string' ? metadata.correction : undefined;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 text-sm',
        correct
          ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950/30 dark:text-green-200'
          : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200',
      )}
    >
      <p className="font-semibold">
        {correct ? 'Correct!' : 'Not quite'} — {matchPercent}% match
      </p>
      {feedback && <p className="mt-1">{feedback}</p>}
      {questionType === 'error_detection' && errorText && correctionText ? (
        <div className="mt-2 space-y-1">
          <p>
            <span className="font-medium">Error: </span>
            <span className="text-red-700 dark:text-red-300">{errorText}</span>
          </p>
          <p>
            <span className="font-medium">Should be: </span>
            <span className="text-green-700 dark:text-green-300">{correctionText}</span>
          </p>
          <p>
            <span className="font-medium">Correct sentence: </span>
            <span className="whitespace-pre-wrap">{correctAnswer}</span>
          </p>
        </div>
      ) : (
        <p className="mt-2">
          <span className="font-medium">Correct answer: </span>
          <span className="whitespace-pre-wrap">{correctAnswer}</span>
        </p>
      )}
    </div>
  );
}

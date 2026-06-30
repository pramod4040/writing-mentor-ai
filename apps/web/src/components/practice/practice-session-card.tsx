'use client';

import { useEffect, useState } from 'react';
import type {
  PracticeQuestionResponse,
  SubmitPracticeAnswerResponse,
} from '@writer-mentor-ai/shared/practice-question';
import { Button } from '@/components/ui/button';
import {
  PracticeQuestionInput,
  PracticeFeedback,
  getQuestionTypeLabel,
} from './practice-question-input';
import { useSubmitPracticeAnswer } from '@/lib/hooks/use-practice-questions';

type PracticeSessionCardProps = {
  question: PracticeQuestionResponse;
  index: number;
  total: number;
  onNext: () => void;
};

export function PracticeSessionCard({
  question,
  index,
  total,
  onNext,
}: PracticeSessionCardProps) {
  const [answer, setAnswer] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(question.timer);
  const [result, setResult] = useState<SubmitPracticeAnswerResponse | null>(null);
  const submit = useSubmitPracticeAnswer(question.id);

  useEffect(() => {
    if (result) return;
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft, result]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    const response = await submit.mutateAsync(answer);
    setResult(response);
  };

  const timedOut = secondsLeft <= 0 && !result;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">
          Question {index + 1} of {total} · {getQuestionTypeLabel(question.questionType)}
        </p>
        <span
          className={
            secondsLeft <= 10 && !result
              ? 'text-sm font-semibold text-red-600'
              : 'text-sm font-medium text-[var(--muted)]'
          }
        >
          {result ? 'Done' : `${secondsLeft}s`}
        </span>
      </div>

      <PracticeQuestionInput
        questionType={question.questionType}
        question={question.question}
        options={question.options}
        metadata={question.metadata}
        value={answer}
        onChange={setAnswer}
        disabled={!!result || timedOut}
      />

      {timedOut && !result && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          Time&apos;s up — submit, skip, or continue typing.
        </p>
      )}

      {result && (
        <div className="mt-4">
          <PracticeFeedback
            correct={result.correct}
            matchPercent={result.matchPercent}
            correctAnswer={result.correctAnswer}
            feedback={result.feedback}
            questionType={question.questionType}
            metadata={question.metadata}
          />
        </div>
      )}

      <div className="mt-6 flex gap-2">
        {!result ? (
          <>
            <Button onClick={handleSubmit} disabled={submit.isPending || !answer.trim()}>
              Submit answer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onNext}
              disabled={submit.isPending}
            >
              Skip
            </Button>
          </>
        ) : (
          <Button onClick={onNext}>
            {index + 1 < total ? 'Next question' : 'Finish'}
          </Button>
        )}
      </div>
    </div>
  );
}

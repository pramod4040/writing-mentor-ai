import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { PracticeQuestionInput, PracticeFeedback } from './practice-question-input';

afterEach(() => cleanup());

describe('PracticeQuestionInput', () => {
  it('renders true/false buttons', () => {
    render(
      <PracticeQuestionInput
        questionType="true_false"
        question="Is grammar important?"
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('true')).toBeDefined();
    expect(screen.getByText('false')).toBeDefined();
  });

  it('renders sentence correction with single-line input', () => {
    render(
      <PracticeQuestionInput
        questionType="sentence_correction"
        question="He go to school."
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Correct this sentence:')).toBeDefined();
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('renders error detection with highlighted error metadata', () => {
    render(
      <PracticeQuestionInput
        questionType="error_detection"
        question="The informations were unclear."
        metadata={{ error: 'informations', correction: 'information' }}
        value=""
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText(/Find and fix the error/)).toBeDefined();
    expect(screen.getByRole('textbox')).toBeDefined();
  });
});

describe('PracticeFeedback', () => {
  it('shows structured error detection feedback', () => {
    render(
      <PracticeFeedback
        correct={false}
        matchPercent={40}
        correctAnswer="The information was unclear."
        questionType="error_detection"
        metadata={{ error: 'informations', correction: 'information' }}
      />,
    );
    expect(screen.getByText(/Error:/)).toBeDefined();
    expect(screen.getByText(/Should be:/)).toBeDefined();
    expect(screen.getByText(/Correct sentence:/)).toBeDefined();
  });
});

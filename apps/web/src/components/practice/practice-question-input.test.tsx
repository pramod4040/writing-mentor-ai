import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PracticeQuestionInput } from './practice-question-input';

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
});

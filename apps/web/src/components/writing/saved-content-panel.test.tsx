import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { SavedContentPanel } from './saved-content-panel';

const mockContents = {
  data: [
    {
      id: 'content-1',
      shortName: 'Hello world',
      question: 'Describe accommodation problems',
      feedback: null,
      textContent: 'Hello world',
      userId: 'demo-user',
      aiReviewedTimes: 1,
      wordCount: 2,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  total: 1,
};

vi.mock('@/lib/hooks/use-contents', () => ({
  useContents: () => ({ data: mockContents, isLoading: false, error: null }),
}));

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('SavedContentPanel', () => {
  it('renders saved content items', () => {
    renderWithClient(<SavedContentPanel onSelect={vi.fn()} />);
    expect(screen.getByText('Hello world')).toBeDefined();
    expect(screen.getByText('2 words · 1 reviews')).toBeDefined();
  });
});

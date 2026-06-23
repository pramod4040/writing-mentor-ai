import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ExampleList } from '@/components/examples/example-list';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('ExampleList', () => {
  it('shows loading state', () => {
    render(<ExampleList />, { wrapper });
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});

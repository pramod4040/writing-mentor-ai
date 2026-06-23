import { ExampleList } from '@/components/examples/example-list';

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">Examples</h1>
      <p className="mt-1 text-base text-[var(--muted)]">
        Reference CRUD integration — AI agents copy this pattern for new features.
      </p>
      <div className="mt-8">
        <ExampleList />
      </div>
    </div>
  );
}

// Pattern: List page with App Router
import { FeatureList } from '@/components/feature/feature-list';

export default function FeatureListPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Features</h1>
      <div className="mt-8">
        <FeatureList />
      </div>
    </main>
  );
}

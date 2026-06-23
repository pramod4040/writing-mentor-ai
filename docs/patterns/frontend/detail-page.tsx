// Pattern: Detail/edit page
'use client';

import { useExample } from '@/lib/hooks/use-example';
import { useParams } from 'next/navigation';

export default function FeatureDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading, error } = useExample(id);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Not found</p>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">{data?.title}</h1>
      <p className="mt-2 text-zinc-600">{data?.description}</p>
    </main>
  );
}

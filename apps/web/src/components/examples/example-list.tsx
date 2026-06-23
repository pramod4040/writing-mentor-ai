'use client';

import { useExamples, useDeleteExample } from '@/lib/hooks/use-example';
import { Button } from '@/components/ui/button';

export function ExampleList() {
  const { data, isLoading, error } = useExamples();
  const deleteExample = useDeleteExample();

  if (isLoading) return <p className="text-zinc-500">Loading...</p>;
  if (error) return <p className="text-red-600">Failed to load examples</p>;

  return (
    <ul className="space-y-2">
      {data?.data.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-zinc-200 p-4"
        >
          <div>
            <h3 className="font-medium">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-zinc-500">{item.description}</p>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => deleteExample.mutate(item.id)}
          >
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}

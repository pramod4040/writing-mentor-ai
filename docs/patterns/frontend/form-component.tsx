// Pattern: Form with React Hook Form + shared Zod schema
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExampleSchema, type CreateExampleInput } from '@writer-mentor-ai/shared/_example';
import { useCreateExample } from '@/lib/hooks/use-example';
import { Button } from '@/components/ui/button';

export function FeatureForm() {
  const create = useCreateExample();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateExampleInput>({
    resolver: zodResolver(createExampleSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => create.mutate(data))} className="space-y-4">
      <div>
        <input {...register('title')} className="w-full rounded border px-3 py-2" />
        {errors.title && <p className="text-sm text-red-600">{errors.title.message}</p>}
      </div>
      <Button type="submit" disabled={create.isPending}>Create</Button>
    </form>
  );
}

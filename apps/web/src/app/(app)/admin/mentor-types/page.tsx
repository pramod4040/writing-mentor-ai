'use client';

import { useState } from 'react';
import type { MentorTypeResponse } from '@writer-mentor-ai/shared/mentor-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useMentorTypes,
  useCreateMentorType,
  useUpdateMentorType,
  useDeleteMentorType,
} from '@/lib/hooks/use-mentor-types';

function MentorTypeForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: MentorTypeResponse | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [systemPrompt, setSystemPrompt] = useState(initial?.systemPrompt ?? '');
  const [practicePrompt, setPracticePrompt] = useState(initial?.practicePrompt ?? '');

  const create = useCreateMentorType();
  const update = useUpdateMentorType(initial?.id ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      description: description || undefined,
      systemPrompt,
      practicePrompt,
    };
    if (initial) {
      await update.mutateAsync(payload);
    } else {
      await create.mutateAsync(payload);
    }
    onSaved();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initial ? 'Edit mentor type' : 'Create mentor type'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practicePrompt">Practice prompt</Label>
            <Textarea
              id="practicePrompt"
              value={practicePrompt}
              onChange={(e) => setPracticePrompt(e.target.value)}
              className="min-h-[120px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="min-h-[200px]"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {initial ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function MentorTypesAdminPage() {
  const { data: mentorTypes, isLoading, error } = useMentorTypes();
  const deleteMentorType = useDeleteMentorType();
  const [editing, setEditing] = useState<MentorTypeResponse | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <p className="p-8">Loading mentor types...</p>;
  if (error) return <p className="p-8 text-red-600">Failed to load mentor types.</p>;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Types</h1>
          <p className="mt-2 text-[var(--muted)]">Configure AI review personas and system prompts.</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditing(null); }}>
          Add mentor type
        </Button>
      </div>

      {(showCreate || editing) && (
        <div className="mb-8">
          <MentorTypeForm
            initial={editing}
            onCancel={() => { setShowCreate(false); setEditing(null); }}
            onSaved={() => { setShowCreate(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="space-y-4">
        {mentorTypes?.map((type) => (
          <Card key={type.id}>
            <CardHeader>
              <CardTitle>{type.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {type.description && <p className="text-base text-[var(--muted)]">{type.description}</p>}
              {type.practicePrompt && (
                <div>
                  <p className="mb-1 text-sm font-medium text-[var(--muted)]">Practice prompt</p>
                  <pre className="whitespace-pre-wrap rounded bg-[var(--accent-soft)] p-3 text-sm text-[var(--foreground)]">
                    {type.practicePrompt}
                  </pre>
                </div>
              )}
              <div>
                <p className="mb-1 text-sm font-medium text-[var(--muted)]">System prompt</p>
                <pre className="whitespace-pre-wrap rounded bg-[var(--accent-soft)] p-3 text-sm text-[var(--foreground)]">
                  {type.systemPrompt}
                </pre>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { setEditing(type); setShowCreate(false); }}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete mentor type "${type.name}"?`)) {
                      deleteMentorType.mutate(type.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

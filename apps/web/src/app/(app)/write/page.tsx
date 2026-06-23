'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ContentResponse } from '@writer-mentor-ai/shared/content';
import { ResizableSidebar } from '@/components/layout/resizable-sidebar';
import { WritingEditor } from '@/components/writing/writing-editor';
import { SavedContentPanel } from '@/components/writing/saved-content-panel';
import { useContents } from '@/lib/hooks/use-contents';
import { useUiStore } from '@/lib/stores/ui-store';

function WritePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentIdParam = searchParams.get('contentId');

  const writeSidebarWidth = useUiStore((s) => s.writeSidebarWidth);
  const setWriteSidebarWidth = useUiStore((s) => s.setWriteSidebarWidth);

  const { data: contentsData } = useContents();
  const [selectedContent, setSelectedContent] = useState<ContentResponse | null>(null);

  const updateContentId = useCallback(
    (contentId: string | null) => {
      const next = new URLSearchParams(searchParams.toString());
      if (contentId) next.set('contentId', contentId);
      else next.delete('contentId');
      const query = next.toString();
      router.replace(query ? `/write?${query}` : '/write');
    },
    [router, searchParams],
  );

  useEffect(() => {
    if (!contentIdParam || !contentsData?.data) return;
    const match = contentsData.data.find((c) => c.id === contentIdParam);
    if (match) setSelectedContent(match);
  }, [contentIdParam, contentsData]);

  const handleSelectContent = (content: ContentResponse) => {
    setSelectedContent(content);
    updateContentId(content.id);
  };

  const handleSaved = (content: ContentResponse) => {
    setSelectedContent(content);
    updateContentId(content.id);
  };

  return (
    <ResizableSidebar
      width={writeSidebarWidth}
      onWidthChange={setWriteSidebarWidth}
      className="h-full"
      main={
        <section className="flex min-h-0 flex-1 flex-col p-4 lg:p-6">
          <WritingEditor
            selectedContent={selectedContent}
            onSaved={handleSaved}
            onNew={() => {
              setSelectedContent(null);
              updateContentId(null);
            }}
          />
        </section>
      }
    >
      <SavedContentPanel
        selectedId={selectedContent?.id}
        onSelect={handleSelectContent}
      />
    </ResizableSidebar>
  );
}

export default function WritePage() {
  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading workspace…</p>}>
        <WritePageContent />
      </Suspense>
    </div>
  );
}

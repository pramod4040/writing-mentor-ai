export type AiReviewSection = {
  id: string;
  title: string;
  body: string;
};

export function parseAiReviewSections(text: string): AiReviewSection[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const sectionPattern = /^(?=\d+\.\s+)/m;
  const parts = trimmed.split(sectionPattern).filter(Boolean);

  const sections: AiReviewSection[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const match = part.match(/^(\d+)\.\s+([^\n]+)\n?([\s\S]*)/);
    if (match) {
      sections.push({
        id: `section-${match[1]}`,
        title: match[2].trim(),
        body: match[3].trim(),
      });
    }
  }

  if (sections.length === 0) {
    return [{ id: 'section-full', title: 'Full review', body: trimmed }];
  }

  return sections;
}

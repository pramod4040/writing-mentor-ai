export function generateShortName(text: string, maxLength = 48): string {
  const line = text.trim().split('\n').find(Boolean) ?? 'Untitled';
  if (line.length <= maxLength) return line;
  return line.slice(0, maxLength - 1).trimEnd() + '…';
}

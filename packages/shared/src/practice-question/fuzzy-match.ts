export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array.from({ length: b.length + 1 }, () => 0),
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[a.length][b.length];
}

export function fuzzyMatchPercent(expected: string, actual: string): number {
  const a = normalizeAnswer(expected);
  const b = normalizeAnswer(actual);
  if (!a && !b) return 100;
  if (!a || !b) return 0;
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  const distance = levenshteinDistance(a, b);
  return Math.round((1 - distance / maxLen) * 100);
}

export function fuzzyMatchJsonPairsPercent(expectedJson: string, actualJson: string): number {
  try {
    const expected = JSON.parse(expectedJson) as Record<string, string>;
    const actual = JSON.parse(actualJson) as Record<string, string>;
    const keys = Object.keys(expected);
    if (keys.length === 0) return fuzzyMatchPercent(expectedJson, actualJson);
    const scores = keys.map((key) => fuzzyMatchPercent(expected[key] ?? '', actual[key] ?? ''));
    return Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  } catch {
    return fuzzyMatchPercent(expectedJson, actualJson);
  }
}

export function normalizeHoldingName(raw: string): string {
  return raw.trim();
}

export function formatHoldingCountLabel(count: number): string {
  if (count === 0) {
    return 'No holdings';
  }
  if (count === 1) {
    return '1 holding';
  }
  return `${count} holdings`;
}

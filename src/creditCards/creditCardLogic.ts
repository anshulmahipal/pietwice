export function normalizeCardName(raw: string): string {
  return raw.trim();
}

/** Short label for summaries and accessibility (e.g. "3 cards"). */
export function formatRegisteredCardCountLabel(count: number): string {
  if (count === 0) {
    return 'No cards';
  }
  if (count === 1) {
    return '1 card';
  }
  return `${count} cards`;
}

export type ParseBillPaymentDayResult =
  | { ok: true; day: number }
  | { ok: false; error: string };

export function parseBillPaymentDay(raw: string): ParseBillPaymentDayResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter the bill payment day (1–31).' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { ok: false, error: 'Use a whole number from 1 to 31.' };
  }
  const day = Number(trimmed);
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return { ok: false, error: 'Day must be between 1 and 31.' };
  }
  return { ok: true, day };
}

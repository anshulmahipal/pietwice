export type ParseDayOfMonthResult =
  | { ok: true; day: number }
  | { ok: false; error: string };

export function parseDayOfMonth(raw: string): ParseDayOfMonthResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter a day of the month (1–31).' };
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

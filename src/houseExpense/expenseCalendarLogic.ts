import { parseAmount } from './expenseDashboardLogic';

/** Delta to record as a line item when category spent changes (signed). */
export function spentDeltaForLineItem(oldSpent: string, newSpent: string): number {
  return parseAmount(newSpent) - parseAmount(oldSpent);
}

/** Net expense for a calendar day as display text (no label), or null when nothing to show. */
export function formatCalendarDayAmountOnly(total: number): string | null {
  if (!Number.isFinite(total) || total === 0) {
    return null;
  }
  const rounded = Math.round(total * 100) / 100;
  const s = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return s;
}

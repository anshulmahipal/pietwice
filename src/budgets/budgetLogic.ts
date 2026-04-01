import { monthYmdRange, toExpenseDateYmd } from '../houseExpense/expenseDate';

export type BudgetPeriodType = 'weekly' | 'biweekly' | 'monthly';

export const BUDGET_PERIODS: BudgetPeriodType[] = ['weekly', 'biweekly', 'monthly'];

export function periodLabel(period: BudgetPeriodType): string {
  switch (period) {
    case 'weekly':
      return 'Weekly';
    case 'biweekly':
      return 'Bi-weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return period;
  }
}

export type ParseBudgetAmountResult =
  | { ok: true; amount: string }
  | { ok: false; error: string };

export function parseBudgetAmount(raw: string): ParseBudgetAmountResult {
  const trimmed = raw.trim();
  if (trimmed === '') {
    return { ok: false, error: 'Enter budget amount.' };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
    return { ok: false, error: 'Use a valid amount (up to 2 decimals).' };
  }
  return { ok: true, amount: trimmed };
}

export function parseBudgetAmountValue(amount: string): number {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

export function currentPeriodRangeYmd(
  period: BudgetPeriodType,
  now: Date = new Date(),
): { startYmd: string; endYmd: string } {
  if (period === 'monthly') {
    return monthYmdRange(now.getFullYear(), now.getMonth());
  }

  const day = now.getDay();
  const mondayOffset = (day + 6) % 7;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  const weekStartYmd = toExpenseDateYmd(weekStart);

  if (period === 'weekly') {
    const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
    return { startYmd: weekStartYmd, endYmd: toExpenseDateYmd(weekEnd) };
  }

  const anchor = new Date(2024, 0, 1);
  const daysDiff = Math.floor((weekStart.getTime() - anchor.getTime()) / (24 * 60 * 60 * 1000));
  const weekIndex = Math.floor(daysDiff / 7);
  const inFirstWeekBlock = weekIndex % 2 === 0;
  const biweeklyStart = inFirstWeekBlock
    ? weekStart
    : new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7);
  const biweeklyEnd = new Date(
    biweeklyStart.getFullYear(),
    biweeklyStart.getMonth(),
    biweeklyStart.getDate() + 13,
  );
  return { startYmd: toExpenseDateYmd(biweeklyStart), endYmd: toExpenseDateYmd(biweeklyEnd) };
}

export function formatBudgetStatus(budgetAmount: number, spentAmount: number): string {
  if (budgetAmount <= 0) {
    return 'No budget set';
  }
  const ratio = spentAmount / budgetAmount;
  if (ratio >= 1.2) {
    return 'Critical overspend';
  }
  if (ratio >= 1) {
    return 'Over budget';
  }
  if (ratio >= 0.8) {
    return 'Near limit';
  }
  return 'On track';
}

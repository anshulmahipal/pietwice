/** Parse a user-entered amount string into a non-negative number. */
export function parseAmount(value: string): number {
  const cleaned = String(value).replace(/,/g, '').trim();
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return n;
}

export function progressSegmentLengths(
  budget: number,
  spent: number,
): { usedFlex: number; pendingFlex: number; usedPercent: number } {
  const b = parseAmount(String(budget));
  const s = parseAmount(String(spent));

  if (b <= 0) {
    return { usedFlex: 0, pendingFlex: 1, usedPercent: 0 };
  }

  const clamped = Math.min(Math.max(0, s), b);
  const usedRatio = clamped / b;
  return {
    usedFlex: usedRatio,
    pendingFlex: 1 - usedRatio,
    usedPercent: Math.round(usedRatio * 100),
  };
}

export function formatUsedPendingLabel(spent: number, budget: number): string {
  const b = parseAmount(String(budget));
  const s = parseAmount(String(spent));
  if (b <= 0) {
    return `${s} / —`;
  }
  return `${s} / ${b}`;
}

export function usedPercentLabel(budget: number, spent: number): string {
  const b = parseAmount(String(budget));
  if (b <= 0) {
    return '—';
  }
  const { usedPercent } = progressSegmentLengths(b, spent);
  return `${usedPercent}%`;
}

export function categoryTitleKey(title: string): string {
  return title.trim().toLowerCase();
}

export type DashboardRowAmounts = {
  amount: string;
  spent: string;
};

/** Sum budgets and spent across categories; pending is remaining budget (never negative). */
export function aggregateDashboardTotals(rows: DashboardRowAmounts[]): {
  totalBudget: number;
  totalSpent: number;
  totalPending: number;
} {
  let totalBudget = 0;
  let totalSpent = 0;
  for (const row of rows) {
    totalBudget += parseAmount(row.amount);
    totalSpent += parseAmount(row.spent);
  }
  const totalPending = Math.max(0, totalBudget - totalSpent);
  return { totalBudget, totalSpent, totalPending };
}

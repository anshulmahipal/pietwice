/**
 * Marketing-page math for the supermarket bill split demo (not app business rules).
 */

export type SplitBillSnapshot = {
  total: number;
  assigned: number;
  remainingToDefault: number;
};

export function clampNonNegative(n: number): number {
  return n < 0 ? 0 : n;
}

export function sumSplitValues(splits: Record<string, number>): number {
  return Object.values(splits).reduce((acc, v) => acc + clampNonNegative(v), 0);
}

export function buildSplitBillSnapshot(total: number, splits: Record<string, number>): SplitBillSnapshot {
  const safeTotal = clampNonNegative(total);
  const assigned = Math.min(sumSplitValues(splits), safeTotal);
  return {
    total: safeTotal,
    assigned,
    remainingToDefault: safeTotal - assigned,
  };
}

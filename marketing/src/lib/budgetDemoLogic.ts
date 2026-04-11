/**
 * Pure helpers for the marketing-page budget playground (no app business rules).
 */

export type BudgetDemoSnapshot = {
  income: number;
  planned: number;
  unallocated: number;
  utilizationPercent: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function buildBudgetDemoSnapshot(income: number, planned: number): BudgetDemoSnapshot {
  const safeIncome = Math.max(0, income);
  const safePlanned = Math.max(0, planned);
  const cappedPlanned = Math.min(safePlanned, safeIncome);
  const unallocated = safeIncome - cappedPlanned;
  const utilizationPercent =
    safeIncome === 0 ? 0 : Math.round((cappedPlanned / safeIncome) * 100);

  return {
    income: safeIncome,
    planned: cappedPlanned,
    unallocated,
    utilizationPercent,
  };
}

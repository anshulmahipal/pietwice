import { useCallback, useEffect, useState } from 'react';
import { loadExpenseTotalForRange } from '../expenseCategories/expenseCategoryDb';
import { loadBudgetPlans, upsertBudgetPlan } from './budgetDb';
import {
  BUDGET_PERIODS,
  currentPeriodRangeYmd,
  formatBudgetStatus,
  parseBudgetAmount,
  parseBudgetAmountValue,
  periodLabel,
  type BudgetPeriodType,
} from './budgetLogic';

export type BudgetOverviewRow = {
  periodType: BudgetPeriodType;
  periodLabel: string;
  amount: string;
  spent: number;
  statusLabel: string;
  rangeLabel: string;
};

export function useBudgetsOverview() {
  const [rows, setRows] = useState<BudgetOverviewRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const plans = await loadBudgetPlans();
    const byPeriod: Record<string, string> = {};
    for (const p of plans) {
      byPeriod[p.periodType] = p.amount;
    }

    const nextRows: BudgetOverviewRow[] = [];
    for (const periodType of BUDGET_PERIODS) {
      const range = currentPeriodRangeYmd(periodType);
      const spent = await loadExpenseTotalForRange(range.startYmd, range.endYmd);
      const amount = byPeriod[periodType] ?? '';
      const amountValue = parseBudgetAmountValue(amount);
      nextRows.push({
        periodType,
        periodLabel: periodLabel(periodType),
        amount,
        spent,
        statusLabel: formatBudgetStatus(amountValue, spent),
        rangeLabel: `${range.startYmd} to ${range.endYmd}`,
      });
    }

    setRows(nextRows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        await reload();
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const saveBudget = useCallback(
    async (periodType: BudgetPeriodType, amountRaw: string) => {
      setFormError(null);
      const parsed = parseBudgetAmount(amountRaw);
      if (!parsed.ok) {
        setFormError(parsed.error);
        return false;
      }
      setIsSaving(true);
      try {
        await upsertBudgetPlan(periodType, parsed.amount);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    rows,
    isReady,
    isSaving,
    formError,
    saveBudget,
    reload,
    clearFormError: () => setFormError(null),
  };
}

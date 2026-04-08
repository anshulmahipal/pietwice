import { useCallback, useEffect, useState } from 'react';
import {
  appendExpenseLineItems,
  loadCategorySpentMap,
  loadExpenseCategoriesFromDb,
  upsertCategorySpent,
} from '../expenseCategories/expenseCategoryDb';
import type { ExpenseCategoryRow } from '../expenseCategories/expenseCategoryLogic';
import { categoryTitleKey } from './expenseDashboardLogic';

export type HouseExpenseDashboardRow = ExpenseCategoryRow & {
  spent: string;
};

export type HouseExpenseEntryDraft = {
  title: string;
  amount: string;
};

export function useHouseExpenseDashboard() {
  const [rows, setRows] = useState<HouseExpenseDashboardRow[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      /** Sequential: both paths call `initExpenseCategoryStore`; parallel runs have stalled SQLite on cold start after auth. */
      const categories = await loadExpenseCategoriesFromDb();
      const spentMap = await loadCategorySpentMap();

      const merged: HouseExpenseDashboardRow[] = categories.map((c) => ({
        ...c,
        spent: spentMap[categoryTitleKey(c.title)] ?? '0',
      }));

      setRows(merged);
    } catch {
      setRows([]);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveSpent = useCallback(
    async (title: string, spent: string, expenseDateYmd: string) => {
      await upsertCategorySpent(categoryTitleKey(title), spent, expenseDateYmd);
      await refresh();
    },
    [refresh],
  );

  const addExpenseEntries = useCallback(
    async (entries: HouseExpenseEntryDraft[], expenseDateYmd: string) => {
      await appendExpenseLineItems(
        entries.map((entry) => ({
          titleKey: categoryTitleKey(entry.title),
          amount: entry.amount,
        })),
        expenseDateYmd,
      );
      await refresh();
    },
    [refresh],
  );

  return {
    rows,
    isReady,
    refresh,
    saveSpent,
    addExpenseEntries,
  };
}

import { useCallback, useState } from 'react';
import {
  loadCategorySpentMap,
  loadExpenseCategoriesFromDb,
  upsertCategorySpent,
} from '../expenseCategories/expenseCategoryDb';
import type { ExpenseCategoryRow } from '../expenseCategories/expenseCategoryLogic';
import { categoryTitleKey } from './expenseDashboardLogic';

export type HouseExpenseDashboardRow = ExpenseCategoryRow & {
  spent: string;
};

export function useHouseExpenseDashboard() {
  const [rows, setRows] = useState<HouseExpenseDashboardRow[]>([]);
  const [isReady, setIsReady] = useState(false);

  const refresh = useCallback(async () => {
    const [categories, spentMap] = await Promise.all([
      loadExpenseCategoriesFromDb(),
      loadCategorySpentMap(),
    ]);

    const merged: HouseExpenseDashboardRow[] = categories.map((c) => ({
      ...c,
      spent: spentMap[categoryTitleKey(c.title)] ?? '0',
    }));

    setRows(merged);
    setIsReady(true);
  }, []);

  const saveSpent = useCallback(
    async (title: string, spent: string, expenseDateYmd: string) => {
      await upsertCategorySpent(categoryTitleKey(title), spent, expenseDateYmd);
      await refresh();
    },
    [refresh],
  );

  return {
    rows,
    isReady,
    refresh,
    saveSpent,
  };
}

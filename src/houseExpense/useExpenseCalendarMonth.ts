import { useCallback, useState } from 'react';
import {
  loadExpenseDayTotalsForMonth,
  loadExpenseLineItemsForDay,
  type ExpenseLineItemRow,
} from '../expenseCategories/expenseCategoryDb';

export function useExpenseCalendarMonth(visibleMonth: Date) {
  const [dayTotals, setDayTotals] = useState<Record<string, number>>({});

  const reloadDayTotals = useCallback(async () => {
    const map = await loadExpenseDayTotalsForMonth(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
    );
    setDayTotals(map);
  }, [visibleMonth]);

  const loadLinesForDay = useCallback(async (ymd: string): Promise<ExpenseLineItemRow[]> => {
    return loadExpenseLineItemsForDay(ymd);
  }, []);

  return {
    dayTotals,
    reloadDayTotals,
    loadLinesForDay,
  };
}

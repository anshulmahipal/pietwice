import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExpenseCategoryRow } from './expenseCategoryLogic';
import { addCategoryRowIfNew, removeCategoryRowAt, updateCategoryRow } from './expenseCategoryLogic';
import { loadExpenseCategoriesFromDb, replaceExpenseCategoriesInDb } from './expenseCategoryDb';

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategoryRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const categoriesRef = useRef<ExpenseCategoryRow[]>([]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const list = await loadExpenseCategoriesFromDb();
      if (!cancelled) {
        categoriesRef.current = list;
        setCategories(list);
        setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCategoriesFromRef = useCallback((next: ExpenseCategoryRow[]) => {
    categoriesRef.current = next;
    setCategories(next);
  }, []);

  const addCategory = useCallback(
    (title: string, amount: string) => {
      const prev = categoriesRef.current;
      const next = addCategoryRowIfNew(prev, title, amount);
      if (next.length === prev.length) {
        return;
      }
      setCategoriesFromRef(next);
    },
    [setCategoriesFromRef],
  );

  const updateCategoryTitle = useCallback(
    (index: number, title: string): boolean => {
      const prev = categoriesRef.current;
      const next = updateCategoryRow(prev, index, 'title', title);
      if (next === prev) {
        return false;
      }
      setCategoriesFromRef(next);
      return true;
    },
    [setCategoriesFromRef],
  );

  const updateCategoryAmount = useCallback(
    (index: number, amount: string) => {
      const prev = categoriesRef.current;
      const next = updateCategoryRow(prev, index, 'amount', amount);
      if (next === prev) {
        return;
      }
      setCategoriesFromRef(next);
    },
    [setCategoriesFromRef],
  );

  /** Removes the row at `index`. No-op if there is only one category (keeps at least one). */
  const removeCategoryAt = useCallback(
    (index: number) => {
      const prev = categoriesRef.current;
      if (prev.length <= 1) {
        return;
      }
      const next = removeCategoryRowAt(prev, index);
      if (next === prev) {
        return;
      }
      setCategoriesFromRef(next);
    },
    [setCategoriesFromRef],
  );

  const saveCategories = useCallback(async () => {
    setIsSaving(true);
    try {
      await replaceExpenseCategoriesInDb(categoriesRef.current);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    categories,
    isReady,
    isSaving,
    addCategory,
    updateCategoryTitle,
    updateCategoryAmount,
    removeCategoryAt,
    saveCategories,
  };
}

import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseAmount } from '../houseExpense/expenseDashboardLogic';
import { loadHouseholdIncome, type HouseholdIncomeStored } from './householdIncomeStorage';

export function useHouseholdIncomeSummary() {
  const [data, setData] = useState<HouseholdIncomeStored | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const v = await loadHouseholdIncome();
    setData(v);
    setReady(true);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const totalMonthly = useMemo(() => {
    if (!data) {
      return 0;
    }
    return parseAmount(data.husbandIncome) + parseAmount(data.wifeIncome);
  }, [data]);

  return { data, ready, totalMonthly };
}

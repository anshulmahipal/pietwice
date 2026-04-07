import { useCallback, useEffect, useState } from 'react';
import { parseDayOfMonth } from '../financeHub/monthlyDayInputLogic';
import { insertInvestment, loadInvestmentsFromDb, type InvestmentRow } from './investmentDb';
import { normalizeHoldingName } from './investmentLogic';

export function useInvestments() {
  const [holdings, setHoldings] = useState<InvestmentRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const rows = await loadInvestmentsFromDb();
    setHoldings(rows);
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

  const addHolding = useCallback(
    async (holdingNameRaw: string, activityDayRaw: string) => {
      setFormError(null);
      const name = normalizeHoldingName(holdingNameRaw);
      if (name === '') {
        setFormError('Enter a holding name.');
        return false;
      }
      const parsed = parseDayOfMonth(activityDayRaw);
      if (!parsed.ok) {
        setFormError(parsed.error);
        return false;
      }
      setIsSaving(true);
      try {
        await insertInvestment(name, parsed.day);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    holdings,
    isReady,
    isSaving,
    formError,
    addHolding,
    clearFormError: () => setFormError(null),
  };
}

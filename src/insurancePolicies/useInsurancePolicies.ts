import { useCallback, useEffect, useState } from 'react';
import { parseDayOfMonth } from '../financeHub/monthlyDayInputLogic';
import {
  insertInsurancePolicy,
  loadInsurancePoliciesFromDb,
  type InsurancePolicyRow,
} from './insurancePolicyDb';
import { normalizePolicyName } from './insurancePolicyLogic';

export function useInsurancePolicies() {
  const [policies, setPolicies] = useState<InsurancePolicyRow[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const rows = await loadInsurancePoliciesFromDb();
    setPolicies(rows);
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

  const addPolicy = useCallback(
    async (policyNameRaw: string, renewalDayRaw: string) => {
      setFormError(null);
      const name = normalizePolicyName(policyNameRaw);
      if (name === '') {
        setFormError('Enter a policy name.');
        return false;
      }
      const parsed = parseDayOfMonth(renewalDayRaw);
      if (!parsed.ok) {
        setFormError(parsed.error);
        return false;
      }
      setIsSaving(true);
      try {
        await insertInsurancePolicy(name, parsed.day);
        await reload();
        return true;
      } finally {
        setIsSaving(false);
      }
    },
    [reload],
  );

  return {
    policies,
    isReady,
    isSaving,
    formError,
    addPolicy,
    clearFormError: () => setFormError(null),
  };
}
